-- =====================================================
-- 012: Tour Price Type (per_person vs total)
-- =====================================================

ALTER TABLE tours ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'per_person' CHECK (price_type IN ('per_person', 'total'));
