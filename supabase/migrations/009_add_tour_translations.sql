-- =====================================================
-- 009: Tour Translations (i18n)
-- =====================================================

CREATE TABLE tour_translations (
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'de', 'fr')),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tour_id, language)
);

CREATE INDEX idx_translations_lang ON tour_translations(language);

ALTER TABLE tour_translations ENABLE ROW LEVEL SECURITY;

-- Public read for translations
CREATE POLICY "translations_public_read" ON tour_translations
  FOR SELECT USING (TRUE);

-- Operators manage translations for their tours
CREATE POLICY "translations_operator_insert" ON tour_translations
  FOR INSERT WITH CHECK (
    tour_id IN (
      SELECT t.id FROM tours t
      JOIN operators o ON o.id = t.operator_id
      WHERE o.user_id = auth.uid()
    )
  );

CREATE POLICY "translations_operator_update" ON tour_translations
  FOR UPDATE USING (
    tour_id IN (
      SELECT t.id FROM tours t
      JOIN operators o ON o.id = t.operator_id
      WHERE o.user_id = auth.uid()
    )
  );

CREATE POLICY "translations_operator_delete" ON tour_translations
  FOR DELETE USING (
    tour_id IN (
      SELECT t.id FROM tours t
      JOIN operators o ON o.id = t.operator_id
      WHERE o.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_tour_translations_updated_at
  BEFORE UPDATE ON tour_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
