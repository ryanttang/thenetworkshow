import { NextRequest } from 'next/server';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory store for rate limiting (use Redis in production)
const store = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyGenerator } = options;

  return (req: NextRequest): RateLimitResult => {
    const key = keyGenerator ? keyGenerator(req) : getDefaultKey(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up expired entries
    const entries = Array.from(store.entries());
    for (const [k, v] of entries) {
      if (v.resetTime < now) {
        store.delete(k);
      }
    }

    const current = store.get(key);
    
    if (!current || current.resetTime < now) {
      // First request or window expired
      const resetTime = now + windowMs;
      store.set(key, { count: 1, resetTime });
      
      return {
        success: true,
        limit: max,
        remaining: max - 1,
        reset: resetTime,
      };
    }

    if (current.count >= max) {
      // Rate limit exceeded
      return {
        success: false,
        limit: max,
        remaining: 0,
        reset: current.resetTime,
      };
    }

    // Increment counter
    current.count++;
    store.set(key, current);

    return {
      success: true,
      limit: max,
      remaining: max - current.count,
      reset: current.resetTime,
    };
  };
}

function getDefaultKey(req: NextRequest): string {
  // Use IP address as default key
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
  return `rate_limit:${ip}`;
}

// Predefined rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window (increased from 5)
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
    return `auth:${ip}`;
  },
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
});

export const contactRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 contact messages per hour
});