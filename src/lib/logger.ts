import { createServiceRoleClient } from "./supabase/server";
import type { AuditActorType } from "./supabase/types";

interface AuditLogParams {
  eventType: string;
  actorType?: AuditActorType;
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

/**
 * Write an audit log entry to the audit_logs table.
 * Uses service role client to bypass RLS.
 * Non-blocking: errors are logged to console but never thrown.
 */
export async function auditLog(params: AuditLogParams): Promise<void> {
  try {
    const supabase = createServiceRoleClient();

    await supabase.from("audit_logs").insert({
      event_type: params.eventType,
      actor_type: params.actorType,
      actor_id: params.actorId,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      metadata: params.metadata || {},
      ip_address: params.ipAddress,
    });
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", params.eventType, error);
  }
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: Request): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}
