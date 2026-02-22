# Cache Testing Guide

Panduan lengkap untuk test apakah caching sudah berfungsi dengan baik.

## 🧪 Method 1: Monitor Server Logs (Console)

### Start Development Server
```bash
npm run dev
```

### Test Cache HIT/MISS

**Test 1: First Request (CACHE MISS)**
```bash
# Request pertama - harus CACHE MISS
curl http://localhost:3000/api/questions?page=1&limit=10
```

**Expected Console Output:**
```
[CACHE MISS] questions:paged:limit=10&page=1
[CACHE SET] questions:paged:limit=10&page=1 (TTL: 2592000s)
```

**Test 2: Second Request (CACHE HIT)**
```bash
# Request kedua - harus CACHE HIT
curl http://localhost:3000/api/questions?page=1&limit=10
```

**Expected Console Output:**
```
[CACHE HIT] questions:paged:limit=10&page=1
```

**✅ Caching Berhasil!** Response kedua lebih cepat karena dari cache.

---

## 🧪 Method 2: Check Cache Statistics

### Get Cache Stats
```bash
curl http://localhost:3000/api/cache/stats
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "keys": 5,
    "hits": 10,
    "misses": 5,
    "hitRate": "66.67%",
    "ksize": 0,
    "vsize": 0
  },
  "keysByPrefix": {
    "questions": ["questions:all", "questions:paged:..."],
    "question": ["question:123", "question:456"]
  },
  "totalKeys": 5,
  "allKeys": [
    "question:123",
    "questions:all",
    "questions:paged:limit=10&page=1"
  ]
}
```

**Meaning:**
- `hits: 10` → Cache berhasil digunakan 10x
- `misses: 5` → Cache tidak ditemukan 5x (pertama kali)
- `hitRate: 66.67%` → 66.67% request pakai cache

**Target:** Hit rate > 90% untuk production

---

## 🧪 Method 3: Test Cache Invalidation

### Step 1: Load Data (Create Cache)
```bash
# GET - Create cache
curl http://localhost:3000/api/questions?page=1&limit=10
```

**Console Output:**
```
[CACHE MISS] questions:paged:...
[CACHE SET] questions:paged:...
```

### Step 2: Request Again (Use Cache)
```bash
# GET - Use cache
curl http://localhost:3000/api/questions?page=1&limit=10
```

**Console Output:**
```
[CACHE HIT] questions:paged:...
```

### Step 3: Create New Question (Invalidate Cache)
```bash
# POST - Create question
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{"question_text": "Test Question", ...}'
```

**Console Output:**
```
[CACHE DELETE PATTERN] questions:* → 3 keys: questions:all, questions:paged:..., questions:exam:1
```

### Step 4: Request Again (Cache MISS - Cache Telah Terhapus)
```bash
# GET - Cache should be cleared
curl http://localhost:3000/api/questions?page=1&limit=10
```

**Console Output:**
```
[CACHE MISS] questions:paged:...  ← Good! Cache invalidated
[CACHE SET] questions:paged:...
```

**✅ Cache Invalidation Berhasil!** Cache dihapus setelah mutation.

---

## 🧪 Method 4: Response Time Comparison

### Test dengan Postman/Thunder Client

**Test 1: First Request (No Cache)**
```
GET http://localhost:3000/api/questions/all
Time: ~150ms (Query DB)
```

**Test 2: Second Request (With Cache)**
```
GET http://localhost:3000/api/questions/all
Time: ~2ms (From Cache)
```

**✅ Speedup:** 75x faster! (150ms → 2ms)

---

## 🧪 Method 5: Manual Cache Clear

### Clear All Cache
```bash
curl -X POST http://localhost:3000/api/cache/clear \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "success": true,
  "message": "All cache cleared"
}
```

### Clear Specific Pattern
```bash
curl -X POST http://localhost:3000/api/cache/clear \
  -H "Content-Type: application/json" \
  -d '{"pattern": "questions:*"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Cleared 5 cache keys matching pattern: questions:*",
  "deletedCount": 5,
  "pattern": "questions:*"
}
```

---

## 📊 Complete Test Scenario

### Scenario: Test Full Cache Flow

```bash
# 1. Clear all cache
curl -X POST http://localhost:3000/api/cache/clear -H "Content-Type: application/json" -d '{}'

# 2. Check stats (should be empty)
curl http://localhost:3000/api/cache/stats
# Expected: { "totalKeys": 0, "hits": 0, "misses": 0 }

# 3. Request data (CACHE MISS)
curl http://localhost:3000/api/questions/all

# 4. Check stats (should have 1 key)
curl http://localhost:3000/api/cache/stats
# Expected: { "totalKeys": 1, "hits": 0, "misses": 1 }

# 5. Request data again (CACHE HIT)
curl http://localhost:3000/api/questions/all

# 6. Check stats (should show hit)
curl http://localhost:3000/api/cache/stats
# Expected: { "totalKeys": 1, "hits": 1, "misses": 1, "hitRate": "50%" }

# 7. Repeat request 10x
for i in {1..10}; do curl http://localhost:3000/api/questions/all; done

# 8. Check final stats
curl http://localhost:3000/api/cache/stats
# Expected: { "hits": 11, "misses": 1, "hitRate": "91.67%" }
```

---

## ✅ Success Indicators

### Caching Berhasil Jika:

1. **Console Logs**
   - ✅ First request: `[CACHE MISS]` + `[CACHE SET]`
   - ✅ Second request: `[CACHE HIT]`

2. **Response Time**
   - ✅ First request: ~50-200ms (DB query)
   - ✅ Second request: ~1-5ms (Cache)

3. **Cache Stats**
   - ✅ Hit rate > 50% (after multiple requests)
   - ✅ Keys stored correctly (check `allKeys`)

4. **Cache Invalidation**
   - ✅ After CREATE: `[CACHE DELETE PATTERN] questions:*`
   - ✅ After UPDATE: `[CACHE DELETE] question:123` + `[CACHE DELETE PATTERN] questions:*`
   - ✅ Next request: `[CACHE MISS]` (cache cleared)

---

## 🔧 Troubleshooting

### Cache Not Working?

**Check 1: Node-cache Installed?**
```bash
npm list node-cache
# Should show: node-cache@5.1.2
```

**Check 2: Cache Module Imported?**
```typescript
// In controller
import * as cache from '../lib/cache';
```

**Check 3: Check Logs**
```bash
# Should see cache logs in terminal
npm run dev
# Make API request
# Check console for [CACHE HIT/MISS/SET]
```

**Check 4: Cache Stats Endpoint Working?**
```bash
curl http://localhost:3000/api/cache/stats
# Should return stats, not 404
```

---

## 📈 Monitoring Tips

### Production Monitoring

1. **Add to Dashboard:**
   - Cache hit rate
   - Cache size
   - Top cached keys

2. **Alert on Low Hit Rate:**
   - If hit rate < 70% → investigate

3. **Monitor Memory:**
   - Cache uses RAM
   - Set `maxKeys` limit if needed

4. **Log Analysis:**
   - Track `[CACHE MISS]` patterns
   - Optimize frequently missed queries

---

## 🎯 Expected Performance

### Before Caching
- Questions API: ~100-200ms
- Database load: High
- Concurrent requests: Slow

### After Caching
- Questions API: ~2-5ms (cache hit)
- Database load: -99%
- Concurrent requests: Fast
- Hit rate target: >90%
