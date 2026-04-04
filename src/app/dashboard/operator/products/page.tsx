"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Tour {
  id: string;
  title: string;
  external_id: string;
  external_provider: string;
  price_cents: number;
  active: boolean;
  synced_at: string;
}

export default function ProductsPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    externalId: "",
    provider: "fareharbor" as "fareharbor" | "bokun",
  });

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("tours")
      .select("*")
      .order("created_at", { ascending: false });
    setTours(data || []);
    setLoading(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    // This would call an API to sync the product from FareHarbor/Bokun
    // For now, save the external ID reference
    setShowForm(false);
    setNewProduct({ externalId: "", provider: "fareharbor" });
    loadTours();
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">I Miei Prodotti</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annulla" : "+ Aggiungi Prodotto"}
        </Button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Collega un prodotto</h2>
            <p className="text-sm text-gray-500">
              Incolla l&apos;ID del prodotto dal tuo account FareHarbor o Bokun.
              Non serve caricare foto o testi: li sincronizziamo automaticamente.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <Label>Piattaforma</Label>
                <Select
                  value={newProduct.provider}
                  onValueChange={(v) =>
                    setNewProduct({ ...newProduct, provider: v as "fareharbor" | "bokun" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fareharbor">FareHarbor</SelectItem>
                    <SelectItem value="bokun">Bokun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="externalId">ID / URL Prodotto</Label>
                <Input
                  id="externalId"
                  required
                  value={newProduct.externalId}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, externalId: e.target.value })
                  }
                  placeholder="es. 12345 o https://fareharbor.com/..."
                />
              </div>
              <Button type="submit">Sincronizza Prodotto</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : tours.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Nessun prodotto collegato. Aggiungi il tuo primo tour!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tours.map((tour) => (
            <Card key={tour.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{tour.title}</p>
                  <p className="text-sm text-gray-500">
                    {tour.external_provider.toUpperCase()} #{tour.external_id} &middot;{" "}
                    {formatCurrency(tour.price_cents)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tour.active ? "default" : "secondary"}>
                    {tour.active ? "Attivo" : "Disattivato"}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    Sync: {new Date(tour.synced_at).toLocaleDateString("it-IT")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
