"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function OperatorSettingsPage() {
  const [operator, setOperator] = useState({
    company_name: "",
    email: "",
    phone: "",
    vat_number: "",
    fareharbor_id: "",
    bokun_id: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadOperator();
  }, []);

  const loadOperator = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("operators")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const op = data as Record<string, string | null> | null;
    if (op) {
      setOperator({
        company_name: op.company_name || "",
        email: op.email || "",
        phone: op.phone || "",
        vat_number: op.vat_number || "",
        fareharbor_id: op.fareharbor_id || "",
        bokun_id: op.bokun_id || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const supabase2 = createClient();
    const { data: { user } } = await supabase2.auth.getUser();
    if (!user) return;

    await supabase2
      .from("operators")
      .update({
        company_name: operator.company_name,
        phone: operator.phone || null,
        fareharbor_id: operator.fareharbor_id || null,
        bokun_id: operator.bokun_id || null,
      })
      .eq("user_id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return <div className="animate-pulse h-64 rounded-lg bg-gray-100" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Impostazioni</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Dati Aziendali</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="companyName">Ragione Sociale</Label>
              <Input
                id="companyName"
                value={operator.company_name}
                onChange={(e) => setOperator({ ...operator, company_name: e.target.value })}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={operator.email} disabled className="bg-gray-50" />
              <p className="mt-1 text-xs text-gray-400">L&apos;email non è modificabile.</p>
            </div>

            <div>
              <Label>Partita IVA</Label>
              <Input value={operator.vat_number} disabled className="bg-gray-50" />
            </div>

            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={operator.phone}
                onChange={(e) => setOperator({ ...operator, phone: e.target.value })}
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-3">Integrazioni</h3>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="fareharborId">FareHarbor Company ID</Label>
                  <Input
                    id="fareharborId"
                    value={operator.fareharbor_id}
                    onChange={(e) => setOperator({ ...operator, fareharbor_id: e.target.value })}
                    placeholder="es. sorrento-tours"
                  />
                </div>
                <div>
                  <Label htmlFor="bokunId">Bokun Vendor ID (opzionale)</Label>
                  <Input
                    id="bokunId"
                    value={operator.bokun_id}
                    onChange={(e) => setOperator({ ...operator, bokun_id: e.target.value })}
                    placeholder="es. 12345"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Salvataggio..." : "Salva modifiche"}
              </Button>
              {saved && <span className="text-sm text-green-600">Salvato!</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
