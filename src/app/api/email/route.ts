import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/client";
import { bookingConfirmedEmail, newBookingOperatorEmail, reviewRequestEmail } from "@/lib/email/templates";

// POST /api/email - Internal email sending endpoint
// Protected: only called by other server-side code via service role
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await request.json();
  const { type, data, to } = body;

  if (!type || !to) {
    return NextResponse.json({ error: "type e to richiesti" }, { status: 400 });
  }

  let emailContent: { subject: string; html: string };

  switch (type) {
    case "booking_confirmed":
      emailContent = bookingConfirmedEmail(data);
      break;
    case "new_booking":
      emailContent = newBookingOperatorEmail(data);
      break;
    case "review_request":
      emailContent = reviewRequestEmail(data);
      break;
    default:
      return NextResponse.json({ error: `Tipo email non supportato: ${type}` }, { status: 400 });
  }

  try {
    await sendEmail({ to, ...emailContent });
    return NextResponse.json({ sent: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
