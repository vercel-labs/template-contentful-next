import { createClient, type RedisClientType } from "redis";

/**
 * NOTE: Redis is OPTIONAL for this template!
 *
 * This code intentionally provides a "fake" fallback if Redis is not configured (i.e., if REDIS_URL
 * is not set). The goal is to make this template work out of the box, even if you don't have
 * Redis running locally, or you just want to try it out before setting up dependencies.
 *
 * If Redis is not available, calls to `getViews()` will return a random placeholder value,
 * and increments do nothing. This lets the template demo itself (including counters and UI)
 * without errors, extra setup, or misleading people about required infrastructure.
 *
 * If you want real counts, set REDIS_URL in your environment, or swap to another storage.
 *
 * (You can safely delete or replace this pattern once you wire up your own persistence layer!)
 */

let redis: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType | null> {
  // DX note: Redis is optional for this template. Callers should NOT need to know that.
  // Keep the optionality contained here, and expose higher-level helpers like `getViews()`.
  if (!process.env.REDIS_URL) {
    return null;
  }
  if (!redis) {
    const url = process.env.REDIS_URL;
    redis = createClient({ url });
    await redis.connect();
  }
  return redis;
}

export async function getViews(slug: string): Promise<number> {
  const client = await getRedisClient();
  // No Redis configured: return a placeholder count so the template can run without setup.
  // This is NOT a real counter and will vary between requests.
  if (!client) {
    try {
      const res = await fetch("https://www.randomnumberapi.com/api/v1.0/random");
      const data = await res.json();
      return typeof data?.[0] === "number" ? data[0] : 0;
    } catch {
      return 0;
    }
  }
  const views = await client.get(`views:${slug}`);
  return views ? parseInt(views, 10) : 0;
}
