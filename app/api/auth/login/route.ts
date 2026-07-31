import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { isRateLimited, getRateLimitIdentifier, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent brute force attacks
    const identifier = getRateLimitIdentifier(request);
    if (isRateLimited(identifier, RATE_LIMITS.AUTH_LOGIN)) {
      return rateLimitResponse(
        RATE_LIMITS.AUTH_LOGIN.message!,
        RATE_LIMITS.AUTH_LOGIN.windowMs
      );
    }

    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = signToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
