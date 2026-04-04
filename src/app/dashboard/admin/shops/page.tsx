"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Shop {
  id: string;
  name: string;
  partita_iva: string;
  email: string;
  qr_code_id: string;
  split_percentage_default: number;
  active: boolean;
  created_at: string;
}

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [newShop, setNewShop] = useState({
    name: "",
    partitaIva: "",
    email: "",
    phone: "",
    iban: "",
    address: "",
    splitPercentage: 10,
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    const res = await fetch("/api/shops");
    const data = await res.json();
    setShops(data.shops || []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const res = await fetch("/api/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newShop),
    });

    if (res.ok) {
      setNewShop({ name: "", partitaIva: "", email: "", phone: "", iban: "", address: "", splitPercentage: 10 });
      loadShops();
    }
    setCreating(false);
  };

  const downloadQr = (shopId: string, format: string) => {
    window.open(`/api/shops/qr?shopId=${shopId}&format=${format}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Negozi Affiliati</h1>
        <Dialog>
          <DialogTrigger>
            <Button>+ Nuovo Negozio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aggiungi Negozio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <Label>Nome</Label>
                <Input required value={newShop.name} onChange={(e) => setNewShop({ ...newShop, name: e.target.value })} />
              </div>
              <div>
                <Label>Partita IVA</Label>
                <Input required value={newShop.partitaIva} onChange={(e) => setNewShop({ ...newShop, partitaIva: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input required type="email" value={newShop.email} onChange={(e) => setNewShop({ ...newShop, email: e.target.value })} />
              </div>
              <div>
                <Label>IBAN</Label>
                <Input value={newShop.iban} onChange={(e) => setNewShop({ ...newShop, iban: e.target.value })} />
              </div>
              <div>
                <Label>Commissione (%)</Label>
                <Input type="number" min={1} max={50} value={newShop.splitPercentage} onChange={(e) => setNewShop({ ...newShop, splitPercentage: parseInt(e.target.value) })} />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Creazione..." : "Crea Negozio e Genera QR"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />)}
        </div>
      ) : shops.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">Nessun negozio affiliato.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {shops.map((shop) => (
            <Card key={shop.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{shop.name}</p>
                  <p className="text-sm text-gray-500">
                    P.IVA: {shop.partita_iva} &middot; {shop.email} &middot; Commissione: {shop.split_percentage_default}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={shop.active ? "default" : "secondary"}>
                    {shop.active ? "Attivo" : "Inattivo"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => downloadQr(shop.id, "png")}>
                    QR PNG
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadQr(shop.id, "svg")}>
                    QR SVG
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
