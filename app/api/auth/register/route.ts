import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { isRateLimited, getRateLimitIdentifier, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent spam registrations
    const identifier = getRateLimitIdentifier(request);
    if (isRateLimited(identifier, RATE_LIMITS.AUTH_REGISTER)) {
      return rateLimitResponse(
        RATE_LIMITS.AUTH_REGISTER.message!,
        RATE_LIMITS.AUTH_REGISTER.windowMs
      );
    }

    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

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

    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
