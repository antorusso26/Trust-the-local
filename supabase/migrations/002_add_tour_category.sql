-- =====================================================
-- Migration 002: Add category column to tours
-- Enables filtering tours by: tour, barca, food, esperienze
-- =====================================================

-- Add category column
ALTER TABLE tours ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'tour';

-- Add check constraint for valid categories
ALTER TABLE tours ADD CONSTRAINT tours_category_check
  CHECK (category IN ('tour', 'barca', 'food', 'esperienze'));

-- Add index for category filtering
CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category);

-- Update existing tours that don't have a category
UPDATE tours SET category = 'tour' WHERE category IS NULL;
