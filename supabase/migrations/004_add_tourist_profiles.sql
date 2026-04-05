-- =====================================================
-- 004: Tourist Profiles
-- =====================================================

CREATE TABLE tourist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_language TEXT DEFAULT 'it' CHECK (preferred_language IN ('it', 'en', 'de', 'fr')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tourist_profiles_user ON tourist_profiles(user_id);
CREATE INDEX idx_tourist_profiles_email ON tourist_profiles(email);

ALTER TABLE tourist_profiles ENABLE ROW LEVEL SECURITY;

-- Tourists can read/update their own profile
CREATE POLICY "tourists_read_own" ON tourist_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tourists_update_own" ON tourist_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tourists_insert_own" ON tourist_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_tourist_profiles_updated_at
  BEFORE UPDATE ON tourist_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
