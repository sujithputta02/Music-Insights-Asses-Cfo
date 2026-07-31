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

export async function GET(request: NextRequest) {
  try {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting - protect OpenAI API costs
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

    return NextResponse.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
      },
      { status: 500 }
    );
  }
}
