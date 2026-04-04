-- =====================================================
-- Trust the Local - Seed Data (Test)
-- =====================================================

-- 1. Create test operators
INSERT INTO operators (id, user_id, company_name, vat_number, vat_verified, email, phone, onboarding_status, fareharbor_id)
VALUES (
  'a1b2c3d4-0001-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'Sorrento Boat Tours S.r.l.',
  'IT12345678901',
  true,
  'info@sorrentoboattours.it',
  '+39 081 8781234',
  'verified',
  'sorrento-boat-tours'
);

INSERT INTO operators (id, user_id, company_name, vat_number, vat_verified, email, phone, onboarding_status, fareharbor_id)
VALUES (
  'a1b2c3d4-0002-4000-8000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Amalfi Adventures S.r.l.',
  'IT98765432109',
  true,
  'info@amalfiadventures.it',
  '+39 089 8712345',
  'verified',
  'amalfi-adventures'
);

INSERT INTO operators (id, user_id, company_name, vat_number, vat_verified, email, phone, onboarding_status, fareharbor_id)
VALUES (
  'a1b2c3d4-0003-4000-8000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  'Costiera Food Experience S.r.l.',
  'IT55566677788',
  true,
  'info@costierafood.it',
  '+39 081 5551234',
  'verified',
  'costiera-food'
);

INSERT INTO operators (id, user_id, company_name, vat_number, vat_verified, email, phone, onboarding_status, fareharbor_id)
VALUES (
  'a1b2c3d4-0004-4000-8000-000000000004',
  '00000000-0000-0000-0000-000000000003',
  'NCC Sorrento Transfer S.r.l.',
  'IT99988877766',
  true,
  'info@nccsorrento.it',
  '+39 081 9991234',
  'verified',
  'ncc-sorrento'
);

-- 2. Create test shops
INSERT INTO shops (id, name, partita_iva, email, phone, split_percentage_default, address, active)
VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'Bar Fauno', 'IT11111111111', 'barfauno@email.it', '+39 081 8781111', 10.00, 'Piazza Tasso 13, Sorrento', true),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'Hotel Riviera', 'IT22222222222', 'reception@hotelriviera.it', '+39 081 8782222', 12.00, 'Via Correale 1, Sorrento', true),
  ('b1b2c3d4-0003-4000-8000-000000000003', 'Ristorante Il Buco', 'IT33333333333', 'info@ilbuco.it', '+39 081 8783333', 8.00, 'Via Marina Piccola 5, Sorrento', true);

-- 3. Create test tours - 4 per categoria

-- ========================
-- CATEGORIA: TOUR (tour guidati)
-- ========================
INSERT INTO tours (id, operator_id, external_id, external_provider, title, description, image_url, price_cents, currency, duration_minutes, active, category)
VALUES
(
  'c1c2c3d4-0001-4000-8000-000000000001',
  'a1b2c3d4-0001-4000-8000-000000000001',
  '10001', 'fareharbor',
  'Tour Privato della Costiera Amalfitana',
  'Esplora Positano, Amalfi e Ravello con guida locale esperta. Trasporto privato, pranzo tipico incluso e soste fotografiche nei punti panoramici più belli della costiera.',
  'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=800&q=80',
  11000, 'EUR', 480, true, 'tour'
),
(
  'c1c2c3d4-0002-4000-8000-000000000002',
  'a1b2c3d4-0002-4000-8000-000000000002',
  '10002', 'fareharbor',
  'Pompei & Vesuvio - Escursione Completa',
  'Visita guidata degli scavi di Pompei e salita al cratere del Vesuvio. Transfer incluso da Sorrento. Pranzo tipico napoletano e guida archeologica certificata.',
  'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80',
  9500, 'EUR', 540, true, 'tour'
),
(
  'c1c2c3d4-0003-4000-8000-000000000003',
  'a1b2c3d4-0001-4000-8000-000000000001',
  '10003', 'fareharbor',
  'Sentiero degli Dei - Trekking Guidato',
  'Trekking sul famoso Sentiero degli Dei da Agerola a Nocelle con guida esperta. Viste mozzafiato sulla costiera. Difficoltà media, scarpe da trekking richieste.',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  4500, 'EUR', 300, true, 'tour'
),
(
  'c1c2c3d4-0004-4000-8000-000000000004',
  'a1b2c3d4-0002-4000-8000-000000000002',
  '10004', 'fareharbor',
  'Ravello & Amalfi - Tour Culturale',
  'Scopri i giardini di Villa Rufolo e Villa Cimbrone a Ravello, poi passeggia per il centro storico di Amalfi con visita al Duomo. Guida storico-artistica.',
  'https://images.unsplash.com/photo-1612698093158-e07ac200d44e?w=800&q=80',
  7000, 'EUR', 360, true, 'tour'
);

-- ========================
-- CATEGORIA: BARCA (gite in barca)
-- ========================
INSERT INTO tours (id, operator_id, external_id, external_provider, title, description, image_url, price_cents, currency, duration_minutes, active, category)
VALUES
(
  'c1c2c3d4-0005-4000-8000-000000000005',
  'a1b2c3d4-0001-4000-8000-000000000001',
  '20001', 'fareharbor',
  'Capri in Barca - Tour Giornaliero',
  'Esplora l''isola di Capri con una gita in barca che include la Grotta Azzurra, i Faraglioni e una sosta per il bagno nelle acque cristalline. Pranzo leggero e bevande incluse.',
  'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=800&q=80',
  13500, 'EUR', 480, true, 'barca'
),
(
  'c1c2c3d4-0006-4000-8000-000000000006',
  'a1b2c3d4-0001-4000-8000-000000000001',
  '20002', 'fareharbor',
  'Costiera Amalfitana - Sunset Cruise',
  'Naviga lungo la Costiera Amalfitana al tramonto. Passa davanti a Positano, Praiano e Amalfi con aperitivo a bordo e musica dal vivo.',
  'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800&q=80',
  8500, 'EUR', 180, true, 'barca'
),
(
  'c1c2c3d4-0007-4000-8000-000000000007',
  'a1b2c3d4-0001-4000-8000-000000000001',
  '20003', 'fareharbor',
  'Snorkeling a Punta Campanella',
  'Avventura subacquea nella riserva marina di Punta Campanella. Attrezzatura completa inclusa, adatto a tutti i livelli. Istruttore certificato a bordo.',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  6500, 'EUR', 150, true, 'barca'
),
(
  'c1c2c3d4-0008-4000-8000-000000000008',
  'a1b2c3d4-0001-4000-8000-000000000001',
  '20004', 'fareharbor',
  'Gita in Barca alle Grotte di Smeraldo',
  'Esplora grotte marine e calette segrete in barca lungo la costa tra Conca dei Marini e Amalfi. Soste per il bagno e snorkeling leggero.',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  7500, 'EUR', 240, true, 'barca'
);

-- ========================
-- CATEGORIA: FOOD (food & limoncello)
-- ========================
INSERT INTO tours (id, operator_id, external_id, external_provider, title, description, image_url, price_cents, currency, duration_minutes, active, category)
VALUES
(
  'c1c2c3d4-0009-4000-8000-000000000009',
  'a1b2c3d4-0003-4000-8000-000000000003',
  '30001', 'fareharbor',
  'Degustazione Limoncello & Tour Agrumeto',
  'Visita un agrumeto storico sorrentino, scopri la produzione del Limoncello IGP e degusta 5 varietà di liquori artigianali con bruschette locali.',
  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
  3500, 'EUR', 90, true, 'food'
),
(
  'c1c2c3d4-0010-4000-8000-000000000010',
  'a1b2c3d4-0003-4000-8000-000000000003',
  '30002', 'fareharbor',
  'Cooking Class - Pasta Fresca & Dolci',
  'Impara a preparare gnocchi alla sorrentina e delizia al limone con una chef locale nella sua cucina tradizionale. Pranzo completo con vino incluso.',
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
  7500, 'EUR', 180, true, 'food'
),
(
  'c1c2c3d4-0011-4000-8000-000000000011',
  'a1b2c3d4-0003-4000-8000-000000000003',
  '30003', 'fareharbor',
  'Wine Tasting tra i Vigneti del Vesuvio',
  'Tour nei vigneti sulle pendici del Vesuvio con degustazione di Lacryma Christi DOC. 6 vini, tagliere di prodotti campani e visita alla cantina.',
  'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
  5500, 'EUR', 150, true, 'food'
),
(
  'c1c2c3d4-0012-4000-8000-000000000012',
  'a1b2c3d4-0003-4000-8000-000000000003',
  '30004', 'fareharbor',
  'Street Food Tour di Napoli',
  'Passeggiata gastronomica per i vicoli di Napoli: pizza fritta, cuoppo, sfogliatella, babà e caffè sospeso. 8 tappe, guida locale appassionata.',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  4500, 'EUR', 180, true, 'food'
);

-- ========================
-- CATEGORIA: ESPERIENZE (esperienze uniche)
-- ========================
INSERT INTO tours (id, operator_id, external_id, external_provider, title, description, image_url, price_cents, currency, duration_minutes, active, category)
VALUES
(
  'c1c2c3d4-0013-4000-8000-000000000013',
  'a1b2c3d4-0002-4000-8000-000000000002',
  '40001', 'fareharbor',
  'Lezione di Ceramica a Vietri sul Mare',
  'Crea il tuo piatto in ceramica vietrese con un maestro artigiano. Workshop pratico nella bottega storica, porta a casa la tua opera d''arte.',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80',
  5500, 'EUR', 120, true, 'esperienze'
),
(
  'c1c2c3d4-0014-4000-8000-000000000014',
  'a1b2c3d4-0002-4000-8000-000000000002',
  '40002', 'fareharbor',
  'Yoga all''Alba con Vista Mare',
  'Sessione di yoga al sorgere del sole su una terrazza panoramica a Positano. Colazione bio inclusa. Per tutti i livelli, tappetino fornito.',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  4000, 'EUR', 90, true, 'esperienze'
),
(
  'c1c2c3d4-0015-4000-8000-000000000015',
  'a1b2c3d4-0002-4000-8000-000000000002',
  '40003', 'fareharbor',
  'Fotografia al Tramonto - Photo Walk',
  'Photo walk guidata nei vicoli più fotogenici di Sorrento e Massa Lubrense al tramonto. Fotografo professionista, consigli tecnici e 10 foto editati inclusi.',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  6000, 'EUR', 150, true, 'esperienze'
),
(
  'c1c2c3d4-0016-4000-8000-000000000016',
  'a1b2c3d4-0002-4000-8000-000000000002',
  '40004', 'fareharbor',
  'Pesca Tradizionale con i Pescatori',
  'Esci in mare all''alba con pescatori locali di Cetara. Impara le tecniche tradizionali, poi cucina il pescato sulla barca. Esperienza autentica e unica.',
  'https://images.unsplash.com/photo-1545816250-e12decedb6bc?w=800&q=80',
  8500, 'EUR', 300, true, 'esperienze'
);
