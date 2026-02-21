/**
 * Cache Utility untuk API Responses
 * 
 * Menggunakan NodeCache untuk in-memory caching
 * TTL default: 30 hari (1 bulan)
 */

import NodeCache from 'node-cache';

// Cache configuration
const ONE_MINUTE = 60;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;
const ONE_MONTH = ONE_DAY * 30;

// Initialize cache instance
const cache = new NodeCache({
  stdTTL: ONE_MONTH, // Default: 1 bulan
  checkperiod: ONE_HOUR, // Check untuk expired keys setiap 1 jam
  useClones: false, // Untuk performa, tidak clone objects
  deleteOnExpire: true,
  maxKeys: 10000, // Max keys untuk prevent memory leak
});

/**
 * Cache durations
 */
export const CACHE_DURATION = {
  ONE_MINUTE,
  FIVE_MINUTES: ONE_MINUTE * 5,
  TEN_MINUTES: ONE_MINUTE * 10,
  THIRTY_MINUTES: ONE_MINUTE * 30,
  ONE_HOUR,
  SIX_HOURS: ONE_HOUR * 6,
  TWELVE_HOURS: ONE_HOUR * 12,
  ONE_DAY,
  ONE_WEEK: ONE_DAY * 7,
  ONE_MONTH,
  THREE_MONTHS: ONE_DAY * 90,
};

/**
 * Get value from cache
 */
export function get<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

/**
 * Set value to cache with optional TTL
 */
export function set<T>(key: string, value: T, ttl?: number): boolean {
  return cache.set(key, value, ttl || ONE_MONTH);
}

/**
 * Delete specific key from cache
 */
export function del(key: string | string[]): number {
  return cache.del(key);
}

/**
 * Delete all keys matching pattern
 */
export function delPattern(pattern: string): number {
  const keys = cache.keys();
  const matchingKeys = keys.filter((key) => {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return regex.test(key);
  });
  return cache.del(matchingKeys);
}

/**
 * Clear all cache
 */
export function flush(): void {
  cache.flushAll();
}

/**
 * Get cache statistics
 */
export function getStats() {
  return cache.getStats();
}

/**
 * Check if key exists in cache
 */
export function has(key: string): boolean {
  return cache.has(key);
}

/**
 * Get all cache keys
 */
export function keys(): string[] {
  return cache.keys();
}

/**
 * Middleware helper untuk cache API responses
 */
export function cacheMiddleware<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = ONE_MONTH
): Promise<T> {
  // Check cache first
  const cached = get<T>(key);
  if (cached !== undefined) {
    return Promise.resolve(cached);
  }

  // If not in cache, fetch and cache
  return fetchFn().then((data) => {
    set(key, data, ttl);
    return data;
  });
}

/**
 * Generate cache key dari request parameters
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  return `${prefix}:${sortedParams}`;
}

/**
 * Cache invalidation helpers
 * Strategi: Invalidasi selektif untuk efisiensi
 */
export const invalidate = {
  // Invalidate ALL questions cache (gunakan hanya jika perlu - misalnya bulk operations)
  questions: () => delPattern('question*'),
  
  // Invalidate hanya list caches (questions:all, questions:paged:*, questions:exam:*)
  // Digunakan saat CREATE - karena list berubah tapi individual questions tidak
  questionLists: () => delPattern('questions:*'),
  
  // Invalidate specific question by ID saja (tanpa list)
  question: (id: number) => del(`question:${id}`),
  
  // Invalidate specific question + all list caches
  // Digunakan saat UPDATE/DELETE - karena data question berubah DAN list juga terpengaruh
  questionWithLists: (id: number) => {
    del(`question:${id}`);
    delPattern('questions:*');
  },
  
  // Invalidate questions by exam ID
  questionsByExam: (examId: number) => delPattern(`questions:exam:${examId}*`),
  
  // Invalidate all exam-related cache
  exams: () => delPattern('exam:*'),
  
  // Invalidate specific exam cache
  exam: (id: number) => delPattern(`exam:${id}:*`),
  
  // Invalidate all user-related cache
  users: () => delPattern('user:*'),
  
  // Invalidate specific user cache
  user: (id: string) => delPattern(`user:${id}:*`),
};

export default cache;
