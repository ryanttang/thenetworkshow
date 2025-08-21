interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function createRateLimiter(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  return function rateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;
    
    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return { allowed: true, remaining: maxRequests - 1, resetTime: store[key].resetTime };
    }
    
    if (store[key].count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: store[key].resetTime };
    }
    
    store[key].count++;
    return { 
      allowed: true, 
      remaining: maxRequests - store[key].count, 
      resetTime: store[key].resetTime 
    };
  };
}

export function getClientIdentifier(req: Request): string {
  // In production, you might want to use a more sophisticated method
  // like IP address, user ID, or API key
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwarded || realIp || 'unknown';
  
  return `rate_limit:${ip}`;
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  });
}, 60000); // Clean up every minute
