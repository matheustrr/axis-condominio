import Redis from 'ioredis';

let client: Redis | null = null;

export function getRedis() {
  if (!client) client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', { lazyConnect: true, maxRetriesPerRequest: 1 });
  return client;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try { const value = await getRedis().get(key); return value ? JSON.parse(value) as T : null; } catch { return null; }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60) {
  try { await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds); } catch { /* cache is optional */ }
}

export async function cacheDelete(key: string) {
  try { await getRedis().del(key); } catch { /* cache is optional */ }
}
