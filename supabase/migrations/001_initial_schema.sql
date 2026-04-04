-- =====================================================
-- Trust the Local - Database Schema
-- B2B2C Tour Marketplace
-- =====================================================

-- ENUMS
CREATE TYPE operator_onboarding_status AS ENUM ('pending', 'in_review', 'verified', 'rejected');
CREATE TYPE transaction_status AS ENUM ('pending', 'authorized', 'captured', 'refunded', 'failed');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'refunded');

-- =====================================================
-- OPERATORS (Tour Providers / Fornitori)
-- =====================================================
CREATE TABLE operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  vat_number TEXT UNIQUE NOT NULL,
  vat_verified BOOLEAN DEFAULT FALSE,
  email TEXT NOT NULL,
  phone TEXT,
  stripe_account_id TEXT UNIQUE,
  onboarding_status operator_onboarding_status DEFAULT 'pending',
  fareharbor_id TEXT,
  bokun_id TEXT,
  clickwrap_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_operators_user_id ON operators(user_id);
CREATE INDEX idx_operators_stripe ON operators(stripe_account_id);

-- =====================================================
-- SHOPS (Negozi Affiliati)
-- =====================================================
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  partita_iva TEXT UNIQUE NOT NULL,
  iban TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  qr_code_id TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  split_percentage_default DECIMAL(5,2) DEFAULT 10.00,
  address TEXT,
  contract_accepted_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shops_qr ON shops(qr_code_id);

-- =====================================================
-- TOURS (Catalogo Prodotti Sincronizzati)
-- =====================================================
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT NOT NULL,
  external_provider TEXT NOT NULL CHECK (external_provider IN ('fareharbor', 'bokun')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  currency TEXT DEFAULT 'EUR',
  duration_minutes INTEGER,
  active BOOLEAN DEFAULT TRUE,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tours_operator ON tours(operator_id);
CREATE INDEX idx_tours_active ON tours(active) WHERE active = TRUE;
CREATE UNIQUE INDEX idx_tours_external ON tours(external_provider, external_id);

-- =====================================================
-- BOOKINGS (Prenotazioni)
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES tours(id) ON DELETE RESTRICT NOT NULL,
  operator_id UUID REFERENCES operators(id) ON DELETE RESTRICT NOT NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  booking_date DATE NOT NULL,
  time_slot TEXT,
  guests INTEGER DEFAULT 1 CHECK (guests > 0),
  status booking_status DEFAULT 'pending',
  external_booking_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_operator ON bookings(operator_id);
CREATE INDEX idx_bookings_shop ON bookings(shop_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);

-- =====================================================
-- TRANSACTIONS (Movimenti Finanziari)
-- =====================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT,
  operator_id UUID REFERENCES operators(id) ON DELETE RESTRICT NOT NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  amount_total INTEGER NOT NULL CHECK (amount_total > 0),
  operator_net INTEGER NOT NULL CHECK (operator_net >= 0),
  shop_commission INTEGER NOT NULL DEFAULT 0 CHECK (shop_commission >= 0),
  platform_fee INTEGER NOT NULL CHECK (platform_fee >= 0),
  status transaction_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_transfer_id TEXT,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_operator ON transactions(operator_id);
CREATE INDEX idx_transactions_shop ON transactions(shop_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_stripe_pi ON transactions(stripe_payment_intent_id);

-- =====================================================
-- INVOICES (Autofatture Negozi)
-- =====================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE RESTRICT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_commission INTEGER NOT NULL CHECK (total_commission >= 0),
  external_invoice_id TEXT,
  invoice_provider TEXT DEFAULT 'fattureincloud',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_shop ON invoices(shop_id);
CREATE INDEX idx_invoices_period ON invoices(period_start, period_end);

-- =====================================================
-- AUDIT LOGS (Logging Critico)
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  actor_type TEXT CHECK (actor_type IN ('tourist', 'operator', 'admin', 'system', 'webhook')),
  actor_id TEXT,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_event ON audit_logs(event_type, created_at DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_type, actor_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- OPERATORS: vedono solo i propri dati
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "operators_select_own" ON operators
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "operators_update_own" ON operators
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "operators_insert_own" ON operators
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TOURS: lettura pubblica per tour attivi, gestione solo dall'operatore owner
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tours_public_read" ON tours
  FOR SELECT USING (active = TRUE);

CREATE POLICY "tours_operator_insert" ON tours
  FOR INSERT WITH CHECK (
    operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
  );

CREATE POLICY "tours_operator_update" ON tours
  FOR UPDATE USING (
    operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
  );

CREATE POLICY "tours_operator_delete" ON tours
  FOR DELETE USING (
    operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
  );

-- BOOKINGS: operatori vedono le proprie prenotazioni
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_operator_select" ON bookings
  FOR SELECT USING (
    operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
  );

-- Inserimento bookings: via service role (API server-side)
CREATE POLICY "bookings_service_insert" ON bookings
  FOR INSERT WITH CHECK (TRUE);

-- TRANSACTIONS: operatori vedono le proprie vendite
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_operator_select" ON transactions
  FOR SELECT USING (
    operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
  );

-- SHOPS: lettura solo da admin (gestiti via service role)
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- INVOICES: solo da admin/service role
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- AUDIT_LOGS: solo da admin/service role
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VIEW: Shop Commission (vista limitata per negozi)
-- =====================================================
CREATE VIEW shop_commissions AS
SELECT
  t.shop_id,
  s.name AS shop_name,
  t.shop_commission,
  t.currency,
  t.status,
  t.created_at
FROM transactions t
JOIN shops s ON s.id = t.shop_id
WHERE t.shop_id IS NOT NULL;

-- =====================================================
-- FUNCTIONS: Updated_at trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_operators_updated_at
  BEFORE UPDATE ON operators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
