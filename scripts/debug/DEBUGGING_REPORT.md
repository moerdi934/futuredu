# 🐛 DEBUGGING REPORT: Live Courses API Returns Only 1 Result

## 📋 Summary
API endpoint `/api/courses/live.ts` hanya mengembalikan 1 result (atau bahkan 0) padahal seharusnya ada 4 courses yang memenuhi kriteria.

## 🔍 Root Cause Analysis

### **MASALAH UTAMA: Product Type Filter Salah**

Query menggunakan filter:
```sql
AND p.type = 12  -- Course products
```

**TAPI** berdasarkan data di database:
- **Type 12** = 'Ikatan Dinas' (bukan Courses!)
- **Type 1** = 'Courses' (yang benar!)

### Data Actual di Database:

#### Product Type Table:
| ID | Description     | Series        | Group Product |
|----|----------------|---------------|---------------|
| 1  | Courses        | COURSE        | CRSONL        |
| 2  | Normal Exam    | EXAM          | CRSONL        |
| 3  | SNBT Exam      | SBMPTN        | TOUMPT        |
| 10 | Paket          | PAKET         | PPAKET        |
| 12 | Ikatan Dinas   | IKATANDINAS   | TOUMPT        |
| 13 | Live Tutor     | BIMBEL        | CRSONL        |

#### Courses dengan Products (4 courses tersedia):
| Course ID | Title                              | Product ID | Product Type | Stock  |
|-----------|-----------------------------------|------------|--------------|--------|
| 40        | Course 1                          | 15         | **1**        | 999999 |
| 41        | Test 2                            | 16         | **1**        | 999996 |
| 43        | Mastering Modern Web Development  | 11         | **10**       | 989    |
| 56        | Test with latihan                 | 28         | **1**        | 999999 |

#### Price History (semua CURRENT):
| Product ID | Price  | Status   |
|------------|--------|----------|
| 11         | 800000 | CURRENT  |
| 15         | 10000  | CURRENT  |
| 16         | 10000  | CURRENT  |
| 28         | 5000   | CURRENT  |

## ❌ Current Query Problem

```sql
WHERE c.approval_status = 'approved'
  AND (c.is_deleted IS NULL OR c.is_deleted = false)
  AND p.type = 12  -- ❌ WRONG! Type 12 = Ikatan Dinas, bukan Courses
  AND p.stock > 0
```

Filter `p.type = 12` mengeliminasi **SEMUA** courses karena:
- 3 products dengan type = 1 (Courses)
- 1 product dengan type = 10 (Paket)
- **0 products dengan type = 12**

## ✅ Solution

### Option 1: Filter by Courses Type Only (Type 1)
Jika hanya ingin menampilkan produk course murni:
```sql
AND p.type = 1  -- Courses
```
**Result: 3 courses** (Course 1, Test 2, Test with latihan)

### Option 2: Include Packages (Type 1 OR Type 10)
Jika ingin include paket yang berisi courses:
```sql
AND p.type IN (1, 10)  -- Courses or Paket
```
**Result: 4 courses** (semua courses)

### Option 3: Filter by Group (CRSONL = Online Courses)
Jika ingin filter berdasarkan group:
```sql
AND p.type IN (
  SELECT id FROM product_type WHERE group_product = 'CRSONL'
)
-- Type 1 (Courses), Type 2 (Normal Exam), Type 13 (Live Tutor)
```

## 📊 Verification Results

### Before Fix (p.type = 12):
```
✅ Total courses: 16
✅ Approved courses: 15
✅ Courses with products: 4
❌ Courses with type 12: 0
❌ Final result: 0 courses
```

### After Fix (p.type = 1):
```
✅ Total courses: 16
✅ Approved courses: 15
✅ Courses with products: 4
✅ Courses with type 1: 3
✅ Final result: 3 courses
```

### After Fix (p.type IN (1, 10)):
```
✅ Total courses: 16
✅ Approved courses: 15
✅ Courses with products: 4
✅ Courses with type 1 or 10: 4
✅ Final result: 4 courses
```

## 🔧 Recommended Fix

Ganti di file `pages/api/courses/live.ts` line 62:

```typescript
// BEFORE:
AND p.type = 12  -- Course products

// AFTER:
AND p.type IN (1, 10)  -- Courses and Paket
```

Atau jika hanya ingin Courses murni:
```typescript
AND p.type = 1  -- Courses only
```

## 📝 Additional Notes

1. **Type 12 adalah Ikatan Dinas**, bukan Courses
2. **Type 1 adalah Courses** yang benar
3. **Type 10 adalah Paket** yang mungkin juga perlu ditampilkan
4. Semua 4 courses memiliki price history yang CURRENT
5. Semua 4 courses memiliki stock yang cukup
6. Query lainnya sudah benar (approval_status, price history, etc.)

## 🎯 Impact

Dengan fix ini:
- API akan return 3-4 courses instead of 0-1
- User akan bisa melihat semua courses yang available
- No other side effects karena hanya mengubah type filter

---
Generated: January 4, 2026
