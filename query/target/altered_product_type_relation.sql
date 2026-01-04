-- 1. Backup data existing (opsional)
CREATE TABLE user_target_backup AS SELECT * FROM user_target;
CREATE TABLE exam_score_mapping_backup AS SELECT * FROM exam_score_mapping;

-- 2. Alter user_target table
ALTER TABLE user_target 
  DROP COLUMN IF EXISTS jenis_seleksi,
  DROP COLUMN IF EXISTS sub_jenis_seleksi,
  ADD COLUMN product_type_id INTEGER REFERENCES product_type(id);

-- 3. Alter exam_score_mapping table
ALTER TABLE exam_score_mapping
  DROP COLUMN IF EXISTS jenis_seleksi,
  DROP COLUMN IF EXISTS sub_jenis_seleksi,
  ADD COLUMN product_type_id INTEGER REFERENCES product_type(id);

-- 4. Add indexes for better performance
CREATE INDEX idx_user_target_product_type ON user_target(product_type_id);
CREATE INDEX idx_user_target_user_product ON user_target(user_id, product_type_id);
CREATE INDEX idx_exam_score_product_type ON exam_score_mapping(product_type_id);

-- 5. Update unique constraint
ALTER TABLE user_target DROP CONSTRAINT IF EXISTS user_target_user_jenis_unique;
ALTER TABLE user_target ADD CONSTRAINT user_target_user_product_unique UNIQUE(user_id, product_type_id);