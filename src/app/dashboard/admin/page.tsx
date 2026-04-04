export const dynamic = "force-dynamic";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "Admin Dashboard - Trust the Local",
};

export default async function AdminDashboardPage() {
  const supabase = createServiceRoleClient();

  const [
    { count: operatorCount },
    { count: shopCount },
    { count: bookingCount },
    { data: recentTransactions },
  ] = await Promise.all([
    supabase.from("operators").select("*", { count: "exact", head: true }),
    supabase.from("shops").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalRevenue = (recentTransactions || []).reduce(
    (sum: number, t: { platform_fee: number }) => sum + t.platform_fee,
    0
  );

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Operatori</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{operatorCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Negozi</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{shopCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Prenotazioni</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bookingCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Revenue Piattaforma</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <a href="/dashboard/admin/operators" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-6 text-center">
              <p className="font-semibold">Gestione Operatori</p>
              <p className="text-sm text-gray-500">Verifica KYC, stato account</p>
            </CardContent>
          </Card>
        </a>
        <a href="/dashboard/admin/shops" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-6 text-center">
              <p className="font-semibold">Gestione Negozi</p>
              <p className="text-sm text-gray-500">QR code, commissioni</p>
            </CardContent>
          </Card>
        </a>
        <a href="/dashboard/admin/transactions" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-6 text-center">
              <p className="font-semibold">Transazioni</p>
              <p className="text-sm text-gray-500">Pagamenti, rimborsi, trasferimenti</p>
            </CardContent>
          </Card>
        </a>
      </div>
    </div>
  );
}
