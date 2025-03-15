const cache = new Map();

export function setCache(key, data, ttl = 60) {
  const expires = Date.now() + ttl * 1000;
  cache.set(key, { data, expires });
}

export function getCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expires) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

export function invalidateCache(key) {
  cache.delete(key);
}
