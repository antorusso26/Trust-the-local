/**
 * Database types for Trust the Local.
 * In production, generate these with:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
 */

export type OperatorOnboardingStatus = "pending" | "in_review" | "verified" | "rejected";
export type TransactionStatus = "pending" | "authorized" | "captured" | "refunded" | "failed";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "refunded";
export type ExternalProvider = "fareharbor" | "bokun";
export type InvoiceStatus = "draft" | "sent" | "paid" | "error";
export type AuditActorType = "tourist" | "operator" | "admin" | "system" | "webhook";

export interface Database {
  public: {
    Tables: {
      operators: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          vat_number: string;
          vat_verified: boolean;
          email: string;
          phone: string | null;
          stripe_account_id: string | null;
          onboarding_status: OperatorOnboardingStatus;
          fareharbor_id: string | null;
          bokun_id: string | null;
          clickwrap_accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          vat_number: string;
          vat_verified?: boolean;
          email: string;
          phone?: string | null;
          stripe_account_id?: string | null;
          onboarding_status?: OperatorOnboardingStatus;
          fareharbor_id?: string | null;
          bokun_id?: string | null;
          clickwrap_accepted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["operators"]["Insert"]>;
      };
      shops: {
        Row: {
          id: string;
          name: string;
          partita_iva: string;
          iban: string | null;
          email: string;
          phone: string | null;
          qr_code_id: string;
          split_percentage_default: number;
          address: string | null;
          contract_accepted_at: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          partita_iva: string;
          iban?: string | null;
          email: string;
          phone?: string | null;
          qr_code_id?: string;
          split_percentage_default?: number;
          address?: string | null;
          contract_accepted_at?: string | null;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["shops"]["Insert"]>;
      };
      tours: {
        Row: {
          id: string;
          operator_id: string;
          external_id: string;
          external_provider: ExternalProvider;
          title: string;
          description: string | null;
          image_url: string | null;
          price_cents: number;
          currency: string;
          duration_minutes: number | null;
          active: boolean;
          synced_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          operator_id: string;
          external_id: string;
          external_provider: ExternalProvider;
          title: string;
          description?: string | null;
          image_url?: string | null;
          price_cents: number;
          currency?: string;
          duration_minutes?: number | null;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["tours"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          tour_id: string;
          operator_id: string;
          shop_id: string | null;
          customer_email: string;
          customer_name: string | null;
          booking_date: string;
          time_slot: string | null;
          guests: number;
          status: BookingStatus;
          external_booking_id: string | null;
          stripe_payment_intent_id: string | null;
          amount_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tour_id: string;
          operator_id: string;
          shop_id?: string | null;
          customer_email: string;
          customer_name?: string | null;
          booking_date: string;
          time_slot?: string | null;
          guests?: number;
          status?: BookingStatus;
          external_booking_id?: string | null;
          stripe_payment_intent_id?: string | null;
          amount_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          booking_id: string | null;
          operator_id: string;
          shop_id: string | null;
          amount_total: number;
          operator_net: number;
          shop_commission: number;
          platform_fee: number;
          status: TransactionStatus;
          stripe_payment_intent_id: string | null;
          stripe_transfer_id: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          operator_id: string;
          shop_id?: string | null;
          amount_total: number;
          operator_net: number;
          shop_commission?: number;
          platform_fee: number;
          status?: TransactionStatus;
          stripe_payment_intent_id?: string | null;
          stripe_transfer_id?: string | null;
          currency?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
      invoices: {
        Row: {
          id: string;
          shop_id: string;
          period_start: string;
          period_end: string;
          total_commission: number;
          external_invoice_id: string | null;
          invoice_provider: string;
          status: InvoiceStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          period_start: string;
          period_end: string;
          total_commission: number;
          external_invoice_id?: string | null;
          invoice_provider?: string;
          status?: InvoiceStatus;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          event_type: string;
          actor_type: AuditActorType | null;
          actor_id: string | null;
          resource_type: string | null;
          resource_id: string | null;
          metadata: Record<string, unknown>;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          actor_type?: AuditActorType | null;
          actor_id?: string | null;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Record<string, unknown>;
          ip_address?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
    };
    Views: {
      shop_commissions: {
        Row: {
          shop_id: string;
          shop_name: string;
          shop_commission: number;
          currency: string;
          status: TransactionStatus;
          created_at: string;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: {
      operator_onboarding_status: OperatorOnboardingStatus;
      transaction_status: TransactionStatus;
      booking_status: BookingStatus;
    };
  };
}
