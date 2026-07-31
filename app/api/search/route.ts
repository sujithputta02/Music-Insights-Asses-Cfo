import { NextRequest, NextResponse } from 'next/server';
import { searchAlbums } from '@/lib/itunes';
import { searchSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const limit = searchParams.get('limit');

    const validated = searchSchema.parse({
      query,
      limit: limit ? parseInt(limit) : undefined,
    });

    const results = await searchAlbums(validated);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
