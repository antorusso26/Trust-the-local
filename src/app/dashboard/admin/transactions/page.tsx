export const dynamic = "force-dynamic";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TransactionRow {
  id: string;
  created_at: string;
  amount_total: number;
  operator_net: number;
  shop_commission: number;
  platform_fee: number;
  status: string;
  operators: { company_name: string } | null;
  shops: { name: string } | null;
}

export default async function AdminTransactionsPage() {
  const supabase = createServiceRoleClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      operators(company_name),
      shops(name)
    `)
    .order("created_at", { ascending: false })
    .limit(50) as { data: TransactionRow[] | null };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);

  const statusVariant = (status: string): "default" | "secondary" | "destructive" => {
    if (status === "captured") return "default";
    if (status === "refunded" || status === "failed") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transazioni</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Operatore</TableHead>
                <TableHead>Negozio</TableHead>
                <TableHead className="text-right">Totale</TableHead>
                <TableHead className="text-right">Netto Op.</TableHead>
                <TableHead className="text-right">Comm. Neg.</TableHead>
                <TableHead className="text-right">Fee Piatt.</TableHead>
                <TableHead>Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!transactions || transactions.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nessuna transazione.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">
                        {new Date(tx.created_at).toLocaleDateString("it-IT")}
                      </TableCell>
                      <TableCell>{tx.operators?.company_name || "-"}</TableCell>
                      <TableCell>{tx.shops?.name || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(tx.amount_total)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(tx.operator_net)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(tx.shop_commission)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(tx.platform_fee)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
