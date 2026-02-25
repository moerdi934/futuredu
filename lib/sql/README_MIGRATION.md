# Database Migration Guide

## Migration: Add Unique Constraint to Passage Title

### File
`add_unique_constraint_question_passages_title.sql`

### Purpose
Menambahkan UNIQUE constraint ke kolom `title` di table `question_passages` untuk memastikan tidak ada duplikasi judul bacaan.

### What This Migration Does

1. **Update Existing Duplicates**
   - Mencari semua title yang duplikat
   - Menambahkan angka (" 2", " 3", dst) ke title yang duplikat
   - Yang pertama dibuat tetap tanpa angka

2. **Add Unique Constraint**
   - Menambahkan constraint `question_passages_title_key`
   - Setelah ini, database akan otomatis reject INSERT/UPDATE dengan title yang sama

3. **Verification**
   - Menampilkan constraint yang baru dibuat
   - Menampilkan sample title yang sudah diupdate

### How to Run

#### Via psql Command Line
```bash
psql -U your_username -d your_database -f lib/sql/add_unique_constraint_question_passages_title.sql
```

#### Via pgAdmin or Database Client
1. Open the SQL file
2. Copy the contents
3. Execute in your database client

#### Via Node.js Script (if needed)
```javascript
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  // your database config
});

const sql = fs.readFileSync('./lib/sql/add_unique_constraint_question_passages_title.sql', 'utf8');

pool.query(sql)
  .then(() => console.log('Migration successful'))
  .catch(err => console.error('Migration failed:', err))
  .finally(() => pool.end());
```

### Expected Results

#### Before Migration
```
| id | title                |
|----|---------------------|
| 1  | Bacaan Biologi      |
| 2  | Bacaan Biologi      | <- Duplicate!
| 3  | Bacaan Matematika   |
| 4  | Bacaan Biologi      | <- Duplicate!
```

#### After Migration
```
| id | title                |
|----|---------------------|
| 1  | Bacaan Biologi      | <- Original (no number)
| 2  | Bacaan Biologi 2    | <- Updated
| 3  | Bacaan Matematika   |
| 4  | Bacaan Biologi 3    | <- Updated
```

### Impact on Application

#### Backend (Already Handled)
- Model will throw error with message: `"Judul bacaan '{title}' sudah digunakan. Silakan gunakan judul yang berbeda."`
- Controller returns HTTP 409 (Conflict) with error code `DUPLICATE_TITLE`

#### Frontend
- If user tries to create passage with duplicate title, will receive error message
- User must choose different title or modify existing one

### Rollback (if needed)

```sql
-- Remove the unique constraint
ALTER TABLE question_passages
DROP CONSTRAINT IF EXISTS question_passages_title_key;

-- Note: This does NOT revert the title updates (the numbered titles remain)
-- If you need to revert title changes, you'll need to restore from backup
```

### Verification Queries

```sql
-- Check if constraint exists
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'question_passages'::regclass
  AND conname = 'question_passages_title_key';

-- Check for any remaining duplicates (should return 0 rows)
SELECT title, COUNT(*) as count
FROM question_passages
GROUP BY title
HAVING COUNT(*) > 1;

-- See all updated titles
SELECT id, title, create_date
FROM question_passages
WHERE title ~ ' \d+$'
ORDER BY title, create_date;
```

### Notes

- Run this migration during low-traffic period
- Backup database before running migration
- Test in staging environment first
- The migration is idempotent (safe to run multiple times with some modifications)
