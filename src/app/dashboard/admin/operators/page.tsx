export const dynamic = "force-dynamic";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminOperatorsPage() {
  const supabase = createServiceRoleClient();

  const { data: operators } = await supabase
    .from("operators")
    .select("*")
    .order("created_at", { ascending: false }) as { data: Array<{
      id: string;
      company_name: string;
      vat_number: string;
      vat_verified: boolean;
      email: string;
      onboarding_status: string;
      fareharbor_id: string | null;
      clickwrap_accepted_at: string | null;
      created_at: string;
    }> | null };

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    pending: { label: "In attesa", variant: "secondary" },
    in_review: { label: "In revisione", variant: "default" },
    verified: { label: "Verificato", variant: "default" },
    rejected: { label: "Rifiutato", variant: "destructive" },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Operatori</h1>

      {!operators || operators.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Nessun operatore registrato.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {operators.map((op) => {
            const config = statusConfig[op.onboarding_status] || statusConfig.pending;
            return (
              <Card key={op.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{op.company_name}</p>
                    <p className="text-sm text-gray-500">
                      P.IVA: {op.vat_number} &middot; {op.email}
                      {op.fareharbor_id && ` · FH: ${op.fareharbor_id}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      Registrato: {new Date(op.created_at).toLocaleDateString("it-IT")}
                      {op.clickwrap_accepted_at && " · T&C accettati"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={op.vat_verified ? "default" : "secondary"}>
                      {op.vat_verified ? "P.IVA OK" : "P.IVA ?"}
                    </Badge>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
