-- =====================================================
-- 011: Bookings - Cancellation Self-Service
-- =====================================================

-- Add cancellation fields to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_token TEXT UNIQUE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount_cents INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_percentage INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'it';

CREATE INDEX IF NOT EXISTS idx_bookings_cancel_token ON bookings(cancel_token);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);

-- Tourists can see their own bookings (by user_id)
CREATE POLICY "bookings_tourist_select" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Update tours table for additional fields
ALTER TABLE tours ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 10;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS meeting_point TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS includes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb;

-- Add operator logo
ALTER TABLE operators ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE operators ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE operators ADD COLUMN IF NOT EXISTS address TEXT;

-- Add shop stripe_account_id for payouts
ALTER TABLE shops ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
