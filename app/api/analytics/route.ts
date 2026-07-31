import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { AnalyticsData } from '@/lib/types';

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

    // Fetch all user's albums
    const albums = await prisma.album.findMany({
      where: { userId: user.userId },
    });

    if (albums.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalAlbums: 0,
          totalArtists: 0,
          averageRating: 0,
          genreDistribution: [],
          topArtists: [],
          releasesByYear: [],
          trackCountDistribution: [],
        },
      });
    }

    // Calculate analytics
    const totalAlbums = albums.length;
    
    // Unique artists
    const uniqueArtists = new Set(albums.map((a) => a.artistName)).size;

    // Average rating
    const ratingsSum = albums.reduce((sum, a) => sum + (a.userRating || 0), 0);
    const ratedCount = albums.filter((a) => a.userRating && a.userRating > 0).length;
    const averageRating = ratedCount > 0 ? ratingsSum / ratedCount : 0;

    // Genre distribution
    const genreCounts = albums.reduce((acc, album) => {
      const genre = album.genre || 'Unknown';
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const genreDistribution = Object.entries(genreCounts)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: (count / totalAlbums) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Top artists
    const artistCounts = albums.reduce((acc, album) => {
      acc[album.artistName] = (acc[album.artistName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topArtists = Object.entries(artistCounts)
      .map(([artistName, count]) => ({ artistName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Releases by year
    const yearCounts = albums.reduce((acc, album) => {
      if (album.releaseDate) {
        const year = new Date(album.releaseDate).getFullYear();
        acc[year] = (acc[year] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    const releasesByYear = Object.entries(yearCounts)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);

    // Track count distribution
    const trackRanges = [
      { range: '1-5', min: 1, max: 5 },
      { range: '6-10', min: 6, max: 10 },
      { range: '11-15', min: 11, max: 15 },
      { range: '16-20', min: 16, max: 20 },
      { range: '21+', min: 21, max: Infinity },
    ];

    const trackCountDistribution = trackRanges.map(({ range, min, max }) => ({
      range,
      count: albums.filter(
        (a) => a.trackCount && a.trackCount >= min && a.trackCount <= max
      ).length,
    }));

    const analyticsData: AnalyticsData = {
      totalAlbums,
      totalArtists: uniqueArtists,
      averageRating: Math.round(averageRating * 10) / 10,
      genreDistribution,
      topArtists,
      releasesByYear,
      trackCountDistribution,
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}
