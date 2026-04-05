-- =====================================================
-- 005: Tour Availability Calendar
-- =====================================================

CREATE TABLE tour_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time_slots JSONB DEFAULT '[]'::jsonb,
  max_guests INTEGER NOT NULL DEFAULT 10 CHECK (max_guests > 0),
  booked_guests INTEGER DEFAULT 0 CHECK (booked_guests >= 0),
  blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tour_id, date)
);

CREATE INDEX idx_availability_tour_date ON tour_availability(tour_id, date);
CREATE INDEX idx_availability_date ON tour_availability(date);

ALTER TABLE tour_availability ENABLE ROW LEVEL SECURITY;

-- Public read for available dates
CREATE POLICY "availability_public_read" ON tour_availability
  FOR SELECT USING (TRUE);

-- Operators manage their own tour availability
CREATE POLICY "availability_operator_insert" ON tour_availability
  FOR INSERT WITH CHECK (
    tour_id IN (
      SELECT t.id FROM tours t
      JOIN operators o ON o.id = t.operator_id
      WHERE o.user_id = auth.uid()
    )
  );

CREATE POLICY "availability_operator_update" ON tour_availability
  FOR UPDATE USING (
    tour_id IN (
      SELECT t.id FROM tours t
      JOIN operators o ON o.id = t.operator_id
      WHERE o.user_id = auth.uid()
    )
  );

CREATE POLICY "availability_operator_delete" ON tour_availability
  FOR DELETE USING (
    tour_id IN (
      SELECT t.id FROM tours t
      JOIN operators o ON o.id = t.operator_id
      WHERE o.user_id = auth.uid()
    )
  );
