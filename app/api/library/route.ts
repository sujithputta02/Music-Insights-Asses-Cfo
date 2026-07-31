import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { addAlbumSchema } from '@/lib/validations';
import { ZodError } from 'zod';

// Middleware to extract and verify JWT
function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

// GET /api/library - Get user's album library (with pagination)
export async function GET(request: NextRequest) {
  try {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse pagination params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    // Get total count and paginated results in parallel
    const [total, albums] = await Promise.all([
      prisma.album.count({
        where: { userId: user.userId },
      }),
      prisma.album.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: albums,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Get library error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch library' },
      { status: 500 }
    );
  }
}

// POST /api/library - Add album to library
export async function POST(request: NextRequest) {
  try {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = addAlbumSchema.parse(body);

    // Check if album already exists in user's library
    const existing = await prisma.album.findUnique({
      where: {
        userId_appleCatalogId: {
          userId: user.userId,
          appleCatalogId: validated.appleCatalogId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Album already in library' },
        { status: 400 }
      );
    }

    // Create album
    const album = await prisma.album.create({
      data: {
        userId: user.userId,
        appleCatalogId: validated.appleCatalogId,
        title: validated.title,
        artistName: validated.artistName,
        genre: validated.genre,
        releaseDate: validated.releaseDate ? new Date(validated.releaseDate) : null,
        trackCount: validated.trackCount,
        artworkUrl: validated.artworkUrl,
        collectionPrice: validated.collectionPrice,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: album,
        message: 'Album added to library',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Add to library error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add album to library' },
      { status: 500 }
    );
  }
}
