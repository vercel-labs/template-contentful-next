"use server";
import { getRedisClient } from "@/lib/redis";

export async function incrementViews(slug: string): Promise<void> {
  const client = await getRedisClient();
  if (!client) {
    // No Redis configured → fallback mode. We intentionally don't "increment" anything.
    return;
  }
  await client.incr(`views:${slug}`);
}
