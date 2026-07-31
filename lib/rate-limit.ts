/**
 * Simple in-memory rate limiting middleware
 * For production, use Redis-based solution like @upstash/ratelimit
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

/**
 * Rate limit requests by IP address
 * @param identifier - Usually IP address or user ID
 * @param config - Rate limit configuration
 * @returns true if rate limit exceeded, false otherwise
 */
export function isRateLimited(
  identifier: string,
  config: RateLimitConfig
): boolean {
  const now = Date.now();
  const existing = store.get(identifier);

  // Clean up expired entries periodically
  if (store.size > 10000) {
    for (const [key, value] of store.entries()) {
      if (now > value.resetTime) {
        store.delete(key);
      }
    }
  }

  if (!existing || now > existing.resetTime) {
    // New window or expired window
    store.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return false;
  }

  if (existing.count >= config.maxRequests) {
    return true; // Rate limit exceeded
  }

  // Increment count
  existing.count++;
  return false;
}

/**
 * Get rate limit identifier from request
 * Uses IP address or forwarded IP from proxy
 */
export function getRateLimitIdentifier(request: Request): string {
  // Try to get real IP from headers (for production behind proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }

  // Fallback to connection info (may not work in all environments)
  return 'unknown';
}

/**
 * Preset rate limit configurations
 */
export const RATE_LIMITS = {
  // Authentication endpoints - prevent brute force
  AUTH_LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  AUTH_REGISTER: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many registration attempts. Please try again later.',
  },
  
  // AI endpoints - protect against token exhaustion
  AI_RECOMMENDATIONS: {
    maxRequests: 5, // Reduced from 10 to protect free tier
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'AI recommendation limit reached (5/hour). Please try again later.',
  },
  
  // General API endpoints
  API_GENERAL: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests. Please slow down.',
  },
  
  // Library modifications
  LIBRARY_WRITE: {
    maxRequests: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many library updates. Please try again later.',
  },
};

/**
 * Helper to create rate limited response
 */
export function rateLimitResponse(message: string, retryAfterMs: number) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil(retryAfterMs / 1000).toString(),
      },
    }
  );
}
