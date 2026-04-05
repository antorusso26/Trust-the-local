-- =====================================================
-- 010: Tour Images (Multi-photo gallery)
-- =====================================================

CREATE TABLE tour_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tour_images_tour ON tour_images(tour_id, sort_order);

ALTER TABLE tour_images ENABLE ROW LEVEL SECURITY;

-- Public read for tour images
CREATE POLICY "tour_images_public_read" ON tour_images
  FOR SELECT USING (TRUE);

-- Operators manage images for their tours
CREATE POLICY "tour_images_operator_insert" ON tour_images
  FOR INSERT WITH CHECK (
    tour_id IN (
      SELECT t.id FROM tours t
      JOIN operators o ON o.id = t.operator_id
      WHERE o.user_id = auth.uid()
    )
  );

CREATE POLICY "tour_images_operator_delete" ON tour_images
  FOR DELETE USING (
    tour_id IN (
      SELECT t.id FROM tours t
      JOIN operators o ON o.id = t.operator_id
      WHERE o.user_id = auth.uid()
    )
  );

-- Supabase Storage bucket policies (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tour-images', 'tour-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('operator-logos', 'operator-logos', true);
