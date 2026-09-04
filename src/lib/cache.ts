// Lightweight cache layer.
//
// Uses an in-process TTL map by default. The interface is a one-line swap:
// point `backend()` at Redis or any KV store later without touching callers
// (docker-compose already includes Redis for that future integration).

type CacheBackend = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
};

function memoryBackend(): CacheBackend {
  const store = new Map<string, { v: string; exp: number }>();
  return {
    async get(key) {
      const hit = store.get(key);
      if (!hit) return null;
      if (hit.exp < Date.now()) {
        store.delete(key);
        return null;
      }
      return hit.v;
    },
    async set(key, value, ttlSeconds) {
      store.set(key, { v: value, exp: Date.now() + ttlSeconds * 1000 });
      if (store.size > 2000) {
        for (const [k, e] of store) if (e.exp < Date.now()) store.delete(k);
      }
    },
    async del(key) {
      store.delete(key);
    },
  };
}

const shared = memoryBackend();

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await shared.get(`tp:${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 120): Promise<void> {
  try {
    await shared.set(`tp:${key}`, JSON.stringify(value), ttlSeconds);
  } catch {
    // cache is best-effort
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    await shared.del(`tp:${key}`);
  } catch {
    /* noop */
  }
}

export const cacheKey = (...parts: (string | number)[]) => parts.join(":");