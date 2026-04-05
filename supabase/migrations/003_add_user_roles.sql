-- =====================================================
-- 003: User Roles
-- =====================================================

CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('tourist', 'operator', 'admin')) DEFAULT 'tourist',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_roles_role ON user_roles(role);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own role
CREATE POLICY "users_read_own_role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert/update roles
CREATE POLICY "service_insert_roles" ON user_roles
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "service_update_roles" ON user_roles
  FOR UPDATE USING (TRUE);

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
