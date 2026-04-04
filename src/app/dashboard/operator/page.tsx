export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Dashboard Operatore - Trust the Local",
};

export default async function OperatorDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch operator data
  const { data: operatorData } = await supabase
    .from("operators")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const operator = operatorData as {
    id: string; company_name: string; onboarding_status: string;
  } | null;

  // Fetch recent transactions
  let transactions: Array<{
    id: string; status: string; amount_total: number;
    operator_net: number; created_at: string;
  }> = [];

  if (operator) {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("operator_id", operator.id)
      .order("created_at", { ascending: false })
      .limit(10);
    transactions = (data || []) as typeof transactions;
  }

  // Calculate stats
  const totalRevenue = transactions
    .filter((t) => t.status === "captured")
    .reduce((sum: number, t) => sum + t.operator_net, 0);

  const totalBookings = transactions.filter(
    (t) => t.status === "captured"
  ).length;

  const pendingAmount = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum: number, t) => sum + t.operator_net, 0);

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);

  const statusLabels: Record<string, string> = {
    pending: "In attesa",
    verified: "Verificato",
    in_review: "In revisione",
    rejected: "Rifiutato",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {operator && (
          <Badge variant={operator.onboarding_status === "verified" ? "default" : "secondary"}>
            {statusLabels[operator.onboarding_status] || operator.onboarding_status}
          </Badge>
        )}
      </div>

      {!operator && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">Profilo operatore non trovato.</p>
            <a href="/register" className="mt-2 inline-block text-sm font-medium underline">
              Completa la registrazione
            </a>
          </CardContent>
        </Card>
      )}

      {operator && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <p className="text-sm text-gray-500">Ricavo Totale</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <p className="text-sm text-gray-500">Prenotazioni</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalBookings}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <p className="text-sm text-gray-500">In Attesa</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(pendingAmount)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Transazioni Recenti</h2>
            </CardHeader>
            <CardContent>
              {!transactions || transactions.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  Nessuna transazione ancora.
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{formatCurrency(tx.amount_total)}</p>
                        <p className="text-xs text-gray-500">
                          Netto: {formatCurrency(tx.operator_net)} &middot;{" "}
                          {new Date(tx.created_at).toLocaleDateString("it-IT")}
                        </p>
                      </div>
                      <Badge variant={
                        tx.status === "captured" ? "default" :
                        tx.status === "refunded" ? "destructive" : "secondary"
                      }>
                        {tx.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
