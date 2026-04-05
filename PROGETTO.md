# Trust the Local - Schema Progetto Completo

## Panoramica
Marketplace B2B2C per tour ed esperienze in Costiera Amalfitana.
Negozi locali (bar, hotel, ristoranti) espongono QR code → turisti scansionano e prenotano tour da operatori verificati → la piattaforma gestisce pagamenti split.

---

## 1. ARCHITETTURA

```
Frontend: Next.js 16 (App Router) + TailwindCSS
Backend:  Supabase (PostgreSQL + Auth + Storage + RLS)
Payments: Stripe Connect (Direct Charges)
Email:    Resend (free tier: 3000 email/mese)
Deploy:   Vercel + Supabase Cloud
CDN:      Supabase Storage + Next.js Image Optimization
```

---

## 2. RUOLI UTENTE

| Ruolo      | Descrizione                              | Auth          |
|------------|------------------------------------------|---------------|
| **Turista**    | Prenota tour, vede storico, recensioni   | Opzionale     |
| **Operatore**  | Gestisce tour, prezzi, disponibilità     | Obbligatorio  |
| **Admin**      | Gestisce piattaforma, shop, approvazioni | Obbligatorio  |

### Tabella `user_roles` (nuova)
```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('tourist', 'operator', 'admin')) DEFAULT 'tourist'
);
```

---

## 3. IMMAGINI (Supabase Storage)

### Bucket
- `tour-images` — foto dei tour (operatore + admin caricano)
- `operator-logos` — logo azienda operatore

### Flusso Upload
1. Operatore/Admin carica foto dal dashboard
2. Upload diretto a Supabase Storage via client
3. Resize automatico via Supabase Image Transformation:
   - **Thumbnail** (400x300) → TourCard
   - **Medium** (800x600) → Dettaglio tour
   - **Full** (1600x1200) → Galleria/hero
4. URL salvato in `tours.image_url`

### Limiti
- Max 5 foto per tour
- Max 5MB per foto
- Formati: JPG, PNG, WebP

---

## 4. ACCOUNT TURISTA (Opzionale)

### Senza account
- Prenota con email + nome
- Riceve conferma via email con link unico `/prenotazione/{booking_id}?token={hash}`
- Può cancellare entro 48h via link nella email

### Con account
- Si registra con email/password o Google OAuth
- Dashboard turista con:
  - Storico prenotazioni
  - Tour salvati (preferiti)
  - Recensioni lasciate
  - Dati personali

### Tabella `tourist_profiles` (nuova)
```sql
CREATE TABLE tourist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_language TEXT DEFAULT 'it',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. PRENOTAZIONI & CANCELLAZIONI

### Flusso Prenotazione
1. Turista sceglie tour → compila form (data, persone, nome, email)
2. Checkout Stripe → pagamento
3. Webhook `payment_intent.succeeded` → booking confermato
4. Email conferma al turista + email notifica all'operatore

### Cancellazione Self-Service
**Regole:**
- Entro **48h prima** del tour → rimborso completo (100%)
- Tra **48h e 24h** prima → rimborso parziale (50%)
- Meno di **24h** → nessun rimborso
- Max **1 cancellazione** per prenotazione

**Flusso:**
1. Turista clicca "Cancella" da email o dashboard
2. Sistema calcola rimborso in base alla policy
3. Mostra importo rimborso → turista conferma
4. Refund via Stripe → email conferma cancellazione

---

## 6. SISTEMA EMAIL (Resend - Free Tier)

### Email Transazionali
| Evento                    | Destinatario | Template            |
|---------------------------|-------------|---------------------|
| Prenotazione confermata   | Turista     | `booking_confirmed` |
| Nuova prenotazione        | Operatore   | `new_booking`       |
| Reminder 24h prima        | Turista     | `booking_reminder`  |
| Cancellazione             | Turista     | `booking_cancelled` |
| Cancellazione             | Operatore   | `booking_cancelled_op` |
| Rimborso effettuato       | Turista     | `refund_processed`  |
| Benvenuto operatore       | Operatore   | `welcome_operator`  |
| Report mensile            | Operatore   | `monthly_report`    |

### Implementazione
```
src/lib/email/
  client.ts          — Resend client
  templates/
    booking-confirmed.tsx   — React Email template
    new-booking.tsx
    booking-reminder.tsx
    booking-cancelled.tsx
    welcome-operator.tsx
    monthly-report.tsx
```

### Cron Jobs
- **Reminder 24h**: ogni giorno alle 10:00 → cerca booking per domani → invia reminder
- **Report mensile**: 1° del mese → genera report per ogni operatore

---

## 7. GESTIONE TOUR (Operatore)

### CRUD Tour (Dashboard Operatore)
- **Crea tour**: titolo, descrizione, categoria, prezzo, durata, max persone, foto
- **Modifica**: tutti i campi, attiva/disattiva
- **Elimina**: soft delete (active = false)
- **Foto**: upload multiplo (max 5), drag & drop per riordinare

### Disponibilità & Calendario
```sql
CREATE TABLE tour_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slots JSONB DEFAULT '[]',  -- ["09:00", "14:00", "17:00"]
  max_guests INTEGER NOT NULL DEFAULT 10,
  booked_guests INTEGER DEFAULT 0,
  blocked BOOLEAN DEFAULT FALSE,  -- operatore blocca giorno
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tour_id, date)
);
```

**Flusso:**
1. Operatore imposta disponibilità settimanale (template)
2. Può bloccare/sbloccare date specifiche
3. Al checkout → sistema verifica posti disponibili
4. Dopo booking → incrementa `booked_guests`

### Sync Esterna (FareHarbor/Bokun)
- Import automatico tour da API esterna
- Merge con dati manuali (prezzo locale sovrascrive)
- Sync disponibilità bidirezionale

---

## 8. RECENSIONI

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) UNIQUE,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  tourist_email TEXT NOT NULL,
  tourist_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),  -- NULL se senza account
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  operator_reply TEXT,         -- operatore può rispondere
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Flusso:**
1. 24h dopo il tour → email al turista "Come è andata?" con link
2. Turista lascia rating (1-5 stelle) + commento opzionale
3. Recensione visibile sulla pagina tour
4. Operatore può rispondere
5. Admin può nascondere recensioni inappropriate

---

## 9. PREFERITI (Tour Salvati)

```sql
CREATE TABLE favorites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, tour_id)
);
```

- Icona cuore sulla TourCard e pagina dettaglio
- Richiede account (se non loggato → mostra "Accedi per salvare")
- Pagina "I miei preferiti" nel dashboard turista

---

## 10. CONDIVISIONE SOCIAL

- Bottone "Condividi" sulla pagina tour
- Genera link con Open Graph meta tags:
  - `og:title` = titolo tour
  - `og:image` = immagine tour
  - `og:description` = descrizione
- Share su: WhatsApp, Facebook, Copia Link
- Nessuna API social necessaria (usa URL scheme nativi)

---

## 11. MULTILINGUA (i18n)

### Lingue: IT (default), EN, DE, FR

### Implementazione
```
src/i18n/
  config.ts           — setup lingue
  dictionaries/
    it.json
    en.json
    de.json
    fr.json
```

- Detect lingua browser → suggerisce cambio lingua
- Selettore lingua nel header
- Contenuti tour: l'operatore può inserire traduzioni (opzionale)
- UI tradotta (bottoni, label, messaggi)
- URL: `trustthelocal.it/en/esperienze` o param `?lang=en`

### Tabella traduzioni tour
```sql
CREATE TABLE tour_translations (
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('it', 'en', 'de', 'fr')),
  title TEXT NOT NULL,
  description TEXT,
  PRIMARY KEY (tour_id, language)
);
```

---

## 12. PAGAMENTI & COMMISSIONI

### Flusso Pagamento (Direct Charges)
```
Turista paga €100
  → €80 all'operatore (Stripe Connected Account)
  → €20 application fee
    → €10 commissione shop (fine mese)
    → €10 piattaforma (revenue)
```

### Payout Shop (Automatico)
- Cron mensile (1° del mese)
- Calcola commissioni shop dal mese precedente
- Stripe Transfer automatico dal platform account allo shop
- Genera report per lo shop

### Report Operatore (Mensile)
- Totale prenotazioni
- Revenue lordo / netto
- Commissioni pagate
- Tour più venduti
- Inviato via email come PDF

---

## 13. DASHBOARD ADMIN

### Funzionalità
| Sezione           | Funzioni                                          |
|-------------------|---------------------------------------------------|
| **Overview**      | Revenue totale, prenotazioni oggi, utenti attivi  |
| **Operatori**     | Lista, approva/rifiuta, verifica KYC, ban         |
| **Tour**          | Modera tour, approva prima pubblicazione          |
| **Prenotazioni**  | Cerca, filtra, dettaglio, rimborso manuale        |
| **Shop**          | CRUD shop, genera QR, dashboard commissioni       |
| **Transazioni**   | Tabella con split breakdown, export CSV           |
| **Recensioni**    | Modera, nascondi, rispondi                        |
| **Utenti**        | Lista turisti, blocca account                     |
| **Log**           | Audit trail completo, filtri per tipo/data        |
| **Impostazioni**  | Fee piattaforma %, policy cancellazione           |

---

## 14. QR CODE & TRACKING SHOP

### Generazione QR
1. Admin va su Dashboard → Shop → seleziona negozio
2. Clicca "Genera QR Code"
3. Sistema genera QR con URL: `https://trustthelocal.it/?ref={shop.qr_code_id}`
4. Download PNG (1024px per stampa plexiglass) o SVG

### Tracking Flusso
```
[QR Scan] → /?ref=abc123
    ↓
[ShopTracker] legge ?ref= → salva in localStorage {shopId, timestamp}
    ↓
[Turista naviga e prenota] → localStorage.shopId incluso nel checkout
    ↓
[API Checkout] → crea booking con shop_id + transaction con shop_id
    ↓
[Fine mese] → calcola SUM(shop_commission) per shop → Stripe Transfer
```

### Dashboard Shop
Ogni shop vede (o l'admin per loro):
- **Scansioni QR**: contatore visite con `?ref=` (tracciato via analytics semplice)
- **Prenotazioni generate**: quanti booking con quel shop_id
- **Commissioni maturate**: totale € da incassare
- **Commissioni pagate**: storico pagamenti ricevuti

### Tabella tracking (nuova)
```sql
CREATE TABLE shop_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_hash TEXT  -- hash per privacy, no IP raw
);
```

---

## 15. STRUTTURA FILE COMPLETA

```
src/
├── app/
│   ├── (public)/              # Pagine turista
│   │   ├── page.tsx           # Homepage
│   │   ├── esperienze/        # Catalogo con filtri
│   │   ├── tour/[id]/         # Dettaglio + prenotazione
│   │   ├── checkout/          # Pagamento Stripe
│   │   ├── prenotazione/[id]/ # Conferma + gestione (link email)
│   │   └── layout.tsx         # Header/Footer pubblico
│   │
│   ├── (auth)/                # Login/Register
│   │   ├── login/
│   │   └── register/
│   │
│   ├── dashboard/
│   │   ├── tourist/           # Dashboard turista
│   │   │   ├── page.tsx       # Le mie prenotazioni
│   │   │   ├── favorites/     # Tour salvati
│   │   │   ├── reviews/       # Le mie recensioni
│   │   │   └── settings/      # Profilo + lingua
│   │   │
│   │   ├── operator/          # Dashboard operatore
│   │   │   ├── page.tsx       # Overview vendite
│   │   │   ├── tours/         # CRUD tour + foto + disponibilità
│   │   │   ├── bookings/      # Prenotazioni ricevute
│   │   │   ├── reviews/       # Recensioni + risposte
│   │   │   ├── kyc/           # Verifica Stripe
│   │   │   └── settings/      # Profilo azienda
│   │   │
│   │   ├── admin/             # Dashboard admin
│   │   │   ├── page.tsx       # Overview piattaforma
│   │   │   ├── operators/     # Gestione operatori
│   │   │   ├── tours/         # Moderazione tour
│   │   │   ├── shops/         # Gestione shop + QR
│   │   │   ├── bookings/      # Tutte le prenotazioni
│   │   │   ├── transactions/  # Transazioni + export
│   │   │   ├── reviews/       # Moderazione recensioni
│   │   │   ├── users/         # Gestione utenti
│   │   │   └── logs/          # Audit log
│   │   │
│   │   └── layout.tsx         # Auth guard + sidebar
│   │
│   └── api/
│       ├── operators/         # CRUD operatori
│       ├── tours/             # CRUD tour
│       ├── tours/[id]/images/ # Upload immagini
│       ├── tours/[id]/availability/ # Gestione disponibilità
│       ├── bookings/          # Gestione prenotazioni
│       ├── bookings/[id]/cancel/    # Cancellazione
│       ├── reviews/           # CRUD recensioni
│       ├── favorites/         # Toggle preferiti
│       ├── shops/             # CRUD shop
│       ├── shops/qr/          # Genera QR
│       ├── shops/scans/       # Track scansioni
│       ├── stripe/            # Checkout, webhooks, connect, transfers
│       ├── email/             # Invio email
│       ├── cron/              # Reminder + report mensile
│       └── integrations/      # VIES, FareHarbor, Bokun, FattureInCloud
│
├── components/
│   ├── tour/          # TourCard, TourGrid, CategoryFilter, AvailabilityPicker
│   ├── booking/       # BookingForm, BookingCard, CancelDialog
│   ├── review/        # ReviewCard, ReviewForm, StarRating
│   ├── checkout/      # PaymentForm, Disclaimer
│   ├── dashboard/     # Sidebar, StatsCard, DataTable, Charts
│   ├── tracking/      # ShopTracker
│   ├── upload/        # ImageUpload, ImageGallery
│   ├── i18n/          # LanguageSwitcher
│   └── ui/            # shadcn components
│
├── lib/
│   ├── supabase/      # Client, server, types
│   ├── stripe/        # Client, connect, webhooks
│   ├── email/         # Resend client + templates
│   ├── integrations/  # FareHarbor, Bokun, VIES, FattureInCloud
│   ├── i18n/          # Translations
│   └── utils/         # Helpers, constants
│
├── hooks/
│   ├── useShopTracking.ts
│   ├── useStripeCheckout.ts
│   ├── useFavorites.ts
│   └── useTranslation.ts
│
└── i18n/
    └── dictionaries/  # it.json, en.json, de.json, fr.json
```

---

## 16. MIGRATIONS DA CREARE

```
003_add_user_roles.sql
004_add_tourist_profiles.sql
005_add_tour_availability.sql
006_add_reviews.sql
007_add_favorites.sql
008_add_shop_scans.sql
009_add_tour_translations.sql
010_add_tour_images.sql          # tabella per galleria multi-foto
011_update_bookings_cancel.sql   # campi per cancellazione self-service
```

---

## 17. PRIORITA' IMPLEMENTAZIONE

### FASE 1 - Core (Attuale) ✅
- [x] Homepage + catalogo tour
- [x] Pagina esperienze con filtri
- [x] Tour detail + prenotazione
- [x] Checkout Stripe
- [x] Login/Register operatore
- [x] Dashboard operatore base
- [x] Dashboard admin base
- [x] QR code generation
- [x] Shop tracking localStorage
- [x] Audit logging

### FASE 2 - Produzione
- [ ] Supabase Storage per immagini
- [ ] Upload foto tour (operatore + admin)
- [ ] Sistema email (Resend)
- [ ] Account turista opzionale
- [ ] Dashboard turista (prenotazioni)
- [ ] Cancellazione self-service
- [ ] Disponibilità tour (calendario)
- [ ] Dashboard shop (scansioni + commissioni)

### FASE 3 - Crescita
- [ ] Recensioni + rating
- [ ] Preferiti
- [ ] Condivisione social
- [ ] Multilingua (IT/EN/DE/FR)
- [ ] Report mensile operatore (PDF)
- [ ] Moderazione tour (approvazione admin)
- [ ] Notifiche push (PWA)

### FASE 4 - Scale
- [ ] Sync FareHarbor/Bokun bidirezionale
- [ ] FattureInCloud automatico
- [ ] App mobile nativa (React Native)
- [ ] Sistema referral turista
- [ ] A/B testing prezzi
