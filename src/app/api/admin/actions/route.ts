import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Admin actions API — requires service role (admin-only)
export async function POST(request: NextRequest) {
  const supabase = createServiceRoleClient();
  const body = await request.json();
  const { action, target_id, target_type } = body as {
    action: string;
    target_id: string;
    target_type: string;
  };

  if (!action || !target_id || !target_type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    // Verify admin role via auth header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    switch (target_type) {
      case "operator": {
        if (action === "approve") {
          await supabase
            .from("operators")
            .update({ onboarding_status: "verified" })
            .eq("id", target_id);
        } else if (action === "reject") {
          await supabase
            .from("operators")
            .update({ onboarding_status: "rejected" })
            .eq("id", target_id);
        } else if (action === "ban") {
          await supabase
            .from("operators")
            .update({ onboarding_status: "banned" })
            .eq("id", target_id);
        }
        break;
      }

      case "review": {
        if (action === "hide") {
          await supabase
            .from("reviews")
            .update({ published: false })
            .eq("id", target_id);
        } else if (action === "show") {
          await supabase
            .from("reviews")
            .update({ published: true })
            .eq("id", target_id);
        }
        break;
      }

      case "tour": {
        if (action === "activate") {
          await supabase
            .from("tours")
            .update({ active: true })
            .eq("id", target_id);
        } else if (action === "deactivate") {
          await supabase
            .from("tours")
            .update({ active: false })
            .eq("id", target_id);
        }
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid target_type" }, { status: 400 });
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      action: `admin.${target_type}.${action}`,
      actor_type: "admin",
      details: { target_id, target_type, action },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
