import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { updateAlbumSchema } from '@/lib/validations';
import { ZodError } from 'zod';

function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);
  if (!token) return null;
  return verifyToken(token);
}

// PUT /api/library/[id] - Update album (rating, notes)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateAlbumSchema.parse(body);

    // Check ownership
    const album = await prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Album not found' },
        { status: 404 }
      );
    }

    if (album.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update album
    const updated = await prisma.album.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Album updated successfully',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update album error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update album' },
      { status: 500 }
    );
  }
}

// DELETE /api/library/[id] - Remove album from library
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = authenticate(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check ownership
    const album = await prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Album not found' },
        { status: 404 }
      );
    }

    if (album.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete album
    await prisma.album.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Album removed from library',
    });
  } catch (error) {
    console.error('Delete album error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete album' },
      { status: 500 }
    );
  }
}
