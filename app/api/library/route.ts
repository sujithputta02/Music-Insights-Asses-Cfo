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
    // Authenticate user
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    console.log('Received body:', JSON.stringify(body, null, 2));
    
    // Validate input
    let validated;
    try {
      validated = addAlbumSchema.parse(body);
      console.log('Validated data:', JSON.stringify(validated, null, 2));
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        console.error('Validation error:', validationError.errors);
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }

    // Check if album already exists in user's library
    let existing;
    try {
      existing = await prisma.album.findUnique({
        where: {
          userId_appleCatalogId: {
            userId: user.userId,
            appleCatalogId: validated.appleCatalogId,
          },
        },
      });
    } catch (findError) {
      console.error('Database query error:', findError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to check existing album',
          details: process.env.NODE_ENV === 'development' ? (findError as any)?.message : undefined
        },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Album already in library' },
        { status: 400 }
      );
    }

    // Prepare album data with proper null handling
    const albumData: any = {
      userId: user.userId,
      appleCatalogId: validated.appleCatalogId,
      title: validated.title,
      artistName: validated.artistName,
    };

    // Only add optional fields if they have values
    if (validated.genre) albumData.genre = validated.genre;
    if (validated.releaseDate) {
      try {
        albumData.releaseDate = new Date(validated.releaseDate);
      } catch (e) {
        console.warn('Invalid release date:', validated.releaseDate);
      }
    }
    if (typeof validated.trackCount === 'number') albumData.trackCount = validated.trackCount;
    if (validated.artworkUrl && validated.artworkUrl !== '') albumData.artworkUrl = validated.artworkUrl;
    if (typeof validated.collectionPrice === 'number') albumData.collectionPrice = validated.collectionPrice;
    
    console.log('Creating album with data:', JSON.stringify(albumData, null, 2));

    // Create album in database
    let album;
    try {
      album = await prisma.album.create({
        data: albumData,
      });
      console.log('Album created successfully:', album.id);
    } catch (createError) {
      console.error('Database create error:', createError);
      console.error('Error code:', (createError as any)?.code);
      console.error('Error meta:', (createError as any)?.meta);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create album in database',
          details: process.env.NODE_ENV === 'development' ? (createError as any)?.message : undefined
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: album,
        message: 'Album added to library',
      },
      { status: 201 }
    );
  } catch (error) {
    // Generic error handler for unexpected errors
    console.error('Unexpected error in POST /api/library:', error);
    console.error('Error name:', (error as any)?.name);
    console.error('Error message:', (error as any)?.message);
    console.error('Error stack:', (error as any)?.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
      },
      { status: 500 }
    );
  }
}
