import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { generateMusicInsights } from '@/lib/ai';
import { isRateLimited, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';

function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);
  if (!token) return null;
  return verifyToken(token);
}

// GET - Load cached recommendations from database
export async function GET(request: NextRequest) {
  try {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's albums first
    const albums = await prisma.album.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    if (albums.length === 0) {
      // Return success with empty recommendations and helpful message
      return NextResponse.json({
        success: true,
        data: {
          recommendations: [],
          hasCachedRecommendations: false,
          message: 'No albums in library. Add some albums to get recommendations.',
        },
      });
    }

    // Check for cached recommendations (less than 24 hours old)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cachedRecommendations = await prisma.recommendation.findMany({
      where: {
        userId: user.userId,
        status: 'active',
        generatedAt: {
          gte: twentyFourHoursAgo,
        },
      },
      orderBy: { confidence: 'desc' },
    });

    if (cachedRecommendations.length > 0) {
      // Return cached recommendations
      const recommendations = cachedRecommendations.map((rec: any) => ({
        album: rec.albumData,
        reason: rec.reason,
        confidence: rec.confidence,
      }));

      return NextResponse.json({
        success: true,
        data: {
          recommendations,
          generatedAt: cachedRecommendations[0].generatedAt,
          hasCachedRecommendations: true,
        },
      });
    }

    // No cached recommendations found
    return NextResponse.json({
      success: true,
      data: {
        recommendations: [],
        hasCachedRecommendations: false,
        message: 'No recent recommendations. Click "Generate Recommendations" to create new ones.',
      },
    });
  } catch (error) {
    console.error('Recommendations fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recommendations',
      },
      { status: 500 }
    );
  }
}

// POST - Generate new recommendations and save to database
export async function POST(request: NextRequest) {
  try {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting - protect AI API costs
    const identifier = `ai-${user.userId}`;
    if (isRateLimited(identifier, RATE_LIMITS.AI_RECOMMENDATIONS)) {
      return rateLimitResponse(
        RATE_LIMITS.AI_RECOMMENDATIONS.message!,
        RATE_LIMITS.AI_RECOMMENDATIONS.windowMs
      );
    }

    // Check if AI API key is configured
    if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI recommendations are not configured. Please add GROQ_API_KEY or OPENAI_API_KEY to environment variables.',
        },
        { status: 503 }
      );
    }

    // Fetch user's albums
    const albums = await prisma.album.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    if (albums.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No albums in library. Add some albums to get recommendations.',
        },
        { status: 400 }
      );
    }

    // Generate AI insights
    const insights = await generateMusicInsights(albums);

    // Search iTunes for each recommendation to get full album data
    const recommendationsWithData = await Promise.all(
      insights.recommendations.map(async (rec: any) => {
        try {
          // Search iTunes using the search term provided by AI
          const searchTerm = rec.searchTerm || `${rec.artist} ${rec.album}`;
          const iTunesResponse = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(
              searchTerm
            )}&entity=album&limit=1`
          );
          
          if (!iTunesResponse.ok) {
            console.warn(`iTunes search failed for: ${searchTerm}`);
            return null;
          }

          const iTunesData = await iTunesResponse.json();
          
          if (iTunesData.results && iTunesData.results.length > 0) {
            const album = iTunesData.results[0];
            return {
              album: {
                collectionId: album.collectionId,
                collectionName: album.collectionName,
                artistName: album.artistName,
                artworkUrl100: album.artworkUrl100,
                collectionPrice: album.collectionPrice,
                releaseDate: album.releaseDate,
                primaryGenreName: album.primaryGenreName,
                trackCount: album.trackCount,
              },
              reason: rec.reason,
              confidence: 0.85, // Default confidence since AI doesn't provide it
            };
          }
          
          return null;
        } catch (error) {
          console.error(`Error fetching album data for ${rec.artist} - ${rec.album}:`, error);
          return null;
        }
      })
    );

    // Filter out failed searches
    const validRecommendations = recommendationsWithData.filter((rec) => rec !== null);

    if (validRecommendations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not find any recommended albums on iTunes. Please try again.',
        },
        { status: 500 }
      );
    }

    // Delete old recommendations for this user
    await prisma.recommendation.deleteMany({
      where: { userId: user.userId },
    });

    // Save new recommendations to database
    const savedRecommendations = await Promise.all(
      validRecommendations.map((rec: any) =>
        prisma.recommendation.create({
          data: {
            userId: user.userId,
            appleCatalogId: rec.album.collectionId.toString(),
            albumData: rec.album as any,
            reason: rec.reason,
            confidence: rec.confidence,
            status: 'active',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        personality: insights.personality,
        summary: insights.summary,
        trends: insights.trends,
        recommendations: validRecommendations,
        generatedAt: new Date(),
        hasCachedRecommendations: true,
        savedCount: savedRecommendations.length,
      },
    });
  } catch (error) {
    console.error('Recommendations generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
      },
      { status: 500 }
    );
  }
}
