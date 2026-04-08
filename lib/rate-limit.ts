import { NextRequest } from "next/server";

type RateLimitOptions = {
  interval: number; // time window in ms
  uniqueTokenPerInterval: number; // max users
};

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new Map<string, { count: number; lastReset: number }>();

  return {
    check: (request: NextRequest, limit: number, token: string) => {
      const now = Date.now();

      if (!tokenCache.has(token)) {
        tokenCache.set(token, { count: 1, lastReset: now });
        return;
      }

      const data = tokenCache.get(token)!;

      if (now - data.lastReset > options.interval) {
        data.count = 1;
        data.lastReset = now;
        return;
      }

      if (data.count >= limit) {
        throw new Error("Rate limit exceeded");
      }

      data.count++;
    },
  };
}