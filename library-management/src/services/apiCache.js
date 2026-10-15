/**
 * High-Performance In-Memory API Cache with Stale-While-Revalidate & Deduplication
 * Optimizes API data loading, eliminates redundant network traffic, and speeds up page navigation.
 */

class ApiCache {
  constructor(defaultTtlMs = 60000) {
    this.cache = new Map();
    this.inFlightRequests = new Map();
    this.defaultTtlMs = defaultTtlMs;
    this.stats = { hits: 0, misses: 0, invalidations: 0 };
  }

  /**
   * Generate consistent cache key from method, URL, and query params
   */
  generateKey(method, url, params = {}) {
    const sortedParams = Object.keys(params || {})
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&");
    return `${method.toUpperCase()}:${url}${sortedParams ? `?${sortedParams}` : ""}`;
  }

  /**
   * Retrieve cached data if valid
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    const isExpired = now > entry.expiry;

    if (isExpired) {
      // Stale entry: keep for stale-while-revalidate, but indicate freshness
      return { data: entry.data, isStale: true };
    }

    this.stats.hits++;
    return { data: entry.data, isStale: false };
  }

  /**
   * Store response in cache
   */
  set(key, data, ttlMs = this.defaultTtlMs) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttlMs
    });
  }

  /**
   * Execute request with Deduplication & Stale-While-Revalidate caching
   */
  async fetchWithCache(key, fetchFn, options = {}) {
    const { ttl = this.defaultTtlMs, staleWhileRevalidate = true } = options;

    const cached = this.get(key);

    // If fresh cache hit, return immediately
    if (cached && !cached.isStale) {
      return cached.data;
    }

    // If stale data is available and SWR is allowed, return stale immediately while revalidating
    if (cached && cached.isStale && staleWhileRevalidate) {
      this.revalidateInBackground(key, fetchFn, ttl);
      return cached.data;
    }

    // Check if an identical request is already in-flight (Deduplication)
    if (this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key);
    }

    // Execute new request
    const requestPromise = (async () => {
      try {
        const result = await fetchFn();
        this.set(key, result, ttl);
        return result;
      } finally {
        this.inFlightRequests.delete(key);
      }
    })();

    this.inFlightRequests.set(key, requestPromise);
    return requestPromise;
  }

  /**
   * Background revalidation for Stale-While-Revalidate
   */
  revalidateInBackground(key, fetchFn, ttl) {
    if (this.inFlightRequests.has(key)) return;

    const promise = (async () => {
      try {
        const result = await fetchFn();
        this.set(key, result, ttl);
      } catch (err) {
        console.warn(`Background revalidation failed for ${key}:`, err);
      } finally {
        this.inFlightRequests.delete(key);
      }
    })();

    this.inFlightRequests.set(key, promise);
  }

  /**
   * Invalidate cache matching pattern or prefix (e.g., after POST/PUT/DELETE)
   */
  invalidate(pattern) {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (typeof pattern === "string" ? key.includes(pattern) : pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    this.stats.invalidations += count;
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.inFlightRequests.clear();
  }

  /**
   * Get telemetry stats
   */
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      inFlight: this.inFlightRequests.size
    };
  }
}

export const apiCache = new ApiCache(60000);
export default apiCache;
