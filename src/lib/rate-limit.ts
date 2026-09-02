// In-memory sliding window rate limiter
interface RateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    rateLimitStore.set(key, { attempts: 1, firstAttemptTime: now });
    return { allowed: true, remaining: maxAttempts - 1, resetInMs: windowMs };
  }

  // Check if window has expired
  if (now - record.firstAttemptTime > windowMs) {
    rateLimitStore.set(key, { attempts: 1, firstAttemptTime: now });
    return { allowed: true, remaining: maxAttempts - 1, resetInMs: windowMs };
  }

  // Increment attempts
  record.attempts += 1;
  const remaining = Math.max(0, maxAttempts - record.attempts);
  const resetInMs = windowMs - (now - record.firstAttemptTime);

  if (record.attempts > maxAttempts) {
    return { allowed: false, remaining: 0, resetInMs };
  }

  return { allowed: true, remaining, resetInMs };
}

export function resetRateLimit(key: string) {
  rateLimitStore.delete(key);
}
