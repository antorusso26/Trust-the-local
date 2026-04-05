-- =====================================================
-- 008: Shop QR Scans Tracking
-- =====================================================

CREATE TABLE shop_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_hash TEXT
);

CREATE INDEX idx_shop_scans_shop ON shop_scans(shop_id, scanned_at DESC);
CREATE INDEX idx_shop_scans_date ON shop_scans(scanned_at);

ALTER TABLE shop_scans ENABLE ROW LEVEL SECURITY;

-- Only service role inserts scans (from API)
CREATE POLICY "scans_service_insert" ON shop_scans
  FOR INSERT WITH CHECK (TRUE);

-- Admin reads all scans via service role
