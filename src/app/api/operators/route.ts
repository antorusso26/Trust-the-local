import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { auditLog, getClientIp } from "@/lib/logger";

/**
 * POST /api/operators
 * Create operator profile after auth signup.
 * Uses service role to bypass RLS (operator's own row doesn't exist yet).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, companyName, vatNumber, email, phone, clickwrapAcceptedAt } = body;

    // Validate required fields
    if (!userId || !companyName || !vatNumber || !email) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti: userId, companyName, vatNumber, email" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Check if operator already exists for this user
    const { data: existing } = await supabase
      .from("operators")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Esiste già un profilo operatore per questo utente." },
        { status: 409 }
      );
    }

    // Check if VAT number already in use
    const { data: vatExists } = await supabase
      .from("operators")
      .select("id")
      .eq("vat_number", vatNumber)
      .single();

    if (vatExists) {
      return NextResponse.json(
        { error: "Questa Partita IVA è già registrata sulla piattaforma." },
        { status: 409 }
      );
    }

    // Create operator profile
    const { data: operator, error: insertError } = await supabase
      .from("operators")
      .insert({
        user_id: userId,
        company_name: companyName,
        vat_number: vatNumber,
        email,
        phone: phone || null,
        onboarding_status: "pending",
        clickwrap_accepted_at: clickwrapAcceptedAt || new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("[OPERATOR_CREATE_ERROR]", insertError);
      return NextResponse.json(
        { error: "Errore nella creazione del profilo: " + insertError.message },
        { status: 500 }
      );
    }

    await auditLog({
      eventType: "operator.created",
      actorType: "operator",
      actorId: userId,
      resourceType: "operator",
      resourceId: operator.id,
      metadata: {
        company_name: companyName,
        vat_number: vatNumber,
        email,
      },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ operator }, { status: 201 });
  } catch (error) {
    console.error("[OPERATOR_API_ERROR]", error);
    return NextResponse.json(
      { error: "Errore interno del server." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/operators
 * Get current operator profile (authenticated).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();

    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { data: operator, error: fetchError } = await supabase
      .from("operators")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !operator) {
      return NextResponse.json({ error: "Profilo operatore non trovato" }, { status: 404 });
    }

    return NextResponse.json({ operator });
  } catch (error) {
    console.error("[OPERATOR_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Errore interno del server." },
      { status: 500 }
    );
  }
}
