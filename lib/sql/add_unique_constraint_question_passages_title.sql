-- Migration: Add unique constraint to question_passages.title
-- Date: 2026-02-25
-- Description: 
--   1. Update existing duplicate titles by adding " 2", " 3", etc.
--   2. Add UNIQUE constraint to title column
--   3. This ensures all passage titles are unique going forward

-- Step 1: Find and update duplicate titles
-- This CTE finds all duplicates and assigns row numbers
WITH duplicates AS (
  SELECT 
    id,
    title,
    ROW_NUMBER() OVER (PARTITION BY title ORDER BY create_date, id) as rn
  FROM question_passages
),
updates AS (
  SELECT 
    id,
    title,
    CASE 
      WHEN rn > 1 THEN title || ' ' || rn::text
      ELSE title
    END as new_title
  FROM duplicates
  WHERE rn > 1
)
UPDATE question_passages qp
SET title = u.new_title
FROM updates u
WHERE qp.id = u.id;

-- Step 2: Add unique constraint to title column
ALTER TABLE question_passages
ADD CONSTRAINT question_passages_title_key UNIQUE (title);

-- Verify the constraint
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'question_passages'::regclass
  AND conname = 'question_passages_title_key';

-- Show sample of updated titles (if any were changed)
SELECT id, title, create_date
FROM question_passages
WHERE title ~ ' \d+$'
ORDER BY title, create_date
LIMIT 20;
