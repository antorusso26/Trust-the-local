-- =====================================================
-- 006: Reviews System
-- =====================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL UNIQUE,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  tourist_email TEXT NOT NULL,
  tourist_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  operator_reply TEXT,
  operator_replied_at TIMESTAMPTZ,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_tour ON reviews(tour_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(tour_id, rating);
CREATE INDEX idx_reviews_published ON reviews(published, created_at DESC);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read for published reviews
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (published = TRUE);

-- Tourists can insert reviews (via service role mostly, but allow authenticated)
CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT WITH CHECK (TRUE);

-- Operators can reply to reviews on their tours
CREATE POLICY "reviews_operator_reply" ON reviews
  FOR UPDATE USING (
    tour_id IN (
      SELECT t.id FROM tours t
      JOIN operators o ON o.id = t.operator_id
      WHERE o.user_id = auth.uid()
    )
  );

-- Materialized view for tour ratings (fast reads)
CREATE VIEW tour_ratings AS
SELECT
  tour_id,
  COUNT(*) AS review_count,
  ROUND(AVG(rating)::numeric, 1) AS avg_rating
FROM reviews
WHERE published = TRUE
GROUP BY tour_id;
