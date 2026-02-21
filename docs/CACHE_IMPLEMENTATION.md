# Cache Implementation Guide

## Overview
This application uses in-memory caching with `node-cache` to improve API performance and reduce database load for questions-related endpoints.

## Cache Configuration

### TTL (Time To Live)
- **Questions Cache**: 1 month (2,592,000 seconds)
- Automatically expires after the configured duration
- Can be manually invalidated on data mutations

### Cache Keys Structure
```typescript
// Individual question
question:{id}

// All questions
questions:all

// Paginated questions with filters
questions:paged:{filters}

// Questions by exam ID
questions:exam:{examId}
```

## Cached Endpoints

### GET Operations (Auto-cached)
1. **getAllQuestions** - Cache key: `questions:all`
2. **getPagedQuestions** - Cache key: `questions:paged:{filters}` 
   - Dynamic filters include: subtopic_type, page, limit, search, level
3. **getQuestionsByExamId** - Cache key: `questions:exam:{examId}`
4. **getQuestionById** - Cache key: `question:{id}`

### Mutation Operations (Auto-invalidate)
Strategi invalidasi selektif untuk efisiensi maksimal:

1. **createQuestion** - Hapus **hanya list caches** (`questions:all`, `questions:paged:*`, `questions:exam:*`)
   - Cache individual questions tidak perlu dihapus karena question baru belum di-cache
   
2. **updateQuestion** - Hapus **cache spesifik** (`question:{id}`) + **list caches**
   - Lebih efisien: hanya hapus question yang berubah, bukan semua questions
   
3. **updateBulkQuestions** - Hapus **semua question caches**
   - Karena banyak questions berubah, lebih aman hapus semua
   
4. **appendExamId** - Hapus **hanya list caches**
   - Exam associations berubah tapi data question tidak
   
5. **deleteQuestion** - Hapus **cache spesifik** (`question:{id}`) + **list caches**
   - Question dihapus dari DB dan list harus di-refresh

## Cache Invalidation Strategy

### Automatic Invalidation
Cache is automatically cleared when:
- **Creating new question**: Hapus list caches saja
- **Updating question**: Hapus cache question spesifik + list caches
- **Deleting question**: Hapus cache question spesifik + list caches
- **Modifying exam associations**: Hapus list caches saja

### Selective vs. Global Invalidation

#### ✅ Selective Invalidation (Current Strategy)
```typescript
// UPDATE question ID 123
cache.invalidate.questionWithLists(123);
// ✅ Hapus: question:123, questions:*
// ✅ Tetap ada: question:456, question:789, dst

// CREATE new question
cache.invalidate.questionLists();
// ✅ Hapus: questions:all, questions:paged:*, questions:exam:*  
// ✅ Tetap ada: question:123, question:456, dst (tidak terpengaruh)
```

**Keuntungan:**
- Cache individual questions tetap valid setelah CREATE
- Hanya question yang diubah/dihapus yang kehilangan cache
- Lebih efisien untuk aplikasi dengan banyak questions

**Contoh Performa:**
```
Sebelum: 1000 questions di cache
CREATE question baru:
  ❌ Global: Hapus 1000 cache → 1000 cache miss berikutnya
  ✅ Selective: Hapus 5 list caches → 995 questions masih cached 
```

#### ❌ Global Invalidation (Tidak Digunakan)
```typescript
// Setiap mutation
cache.invalidate.questions(); // Hapus SEMUA cache
```

**Kekurangan:**
- Semua cache hilang meskipun hanya 1 question berubah
- Boros resource: semua requests berikutnya harus query DB lagi
- Tidak efisien untuk aplikasi besar

### Manual Invalidation
```typescript
import * as cache from '../lib/cache';

// 1. Invalidate hanya list caches (untuk CREATE)
cache.invalidate.questionLists(); // Hapus questions:all, questions:paged:*, questions:exam:*

// 2. Invalidate specific question + lists (untuk UPDATE/DELETE)
cache.invalidate.questionWithLists(123); // Hapus question:123 + semua lists

// 3. Invalidate specific question saja (tanpa list)
cache.invalidate.question(123); // Hapus hanya question:123

// 4. Invalidate semua questions (gunakan hati-hati!)
cache.invalidate.questions(); // Hapus SEMUA cache questions (question:* dan questions:*)

// 5. Delete specific cache key
cache.del('question:123');

// 6. Delete all keys matching pattern
cache.delPattern('questions:paged:*');
```

## Performance Benefits

### Before Caching
- Every request queries database
- Multiple identical requests = multiple DB queries
- High database load for frequently accessed data

### After Caching
- First request: Database query + cache storage
- Subsequent requests: Cache HIT (no DB query)
- 1-month cache duration reduces DB load by ~99% for read operations
- Automatic invalidation ensures data consistency

## Cache Statistics

### Monitoring
```typescript
// Get cache stats
cache.get('stats'); // Returns { keys, hits, misses, ksize, vsize }
```

### Expected Performance
- **Cache HIT**: ~1-5ms response time
- **Cache MISS**: ~50-200ms (includes DB query)
- **Target**: >90% cache hit rate for production

## Best Practices

### DO ✅
- Use cache for frequently accessed data
- Invalidate cache after data mutations
- Use descriptive cache keys
- Monitor cache hit/miss rates

### DON'T ❌
- Cache user-specific sensitive data
- Cache data that changes frequently (< 1 minute)
- Store large binary data in cache
- Ignore cache invalidation on updates

## Troubleshooting

### Stale Data Issues
If you see outdated data:
1. Check if mutation operations call `cache.invalidate.questions()`
2. Verify cache invalidation happens AFTER successful DB update
3. Check cache TTL settings

### Memory Issues
If memory usage is high:
1. Check cache size: `cache.get('stats')`
2. Reduce TTL duration if needed
3. Implement cache size limits in [lib/cache/index.ts](lib/cache/index.ts)

### Performance Issues
If caching doesn't improve performance:
1. Check cache hit rate in logs
2. Verify cache keys are consistent
3. Ensure cache is not invalidated too frequently

## Future Enhancements
- [ ] Redis integration for distributed caching
- [ ] Cache warming on application startup
- [ ] Selective cache invalidation (only affected keys)
- [ ] Cache compression for large responses
- [ ] Cache metrics dashboard
