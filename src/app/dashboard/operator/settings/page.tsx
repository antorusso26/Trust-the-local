"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Upload } from "lucide-react";

export default function OperatorSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    email: "",
    phone: "",
    description: "",
    website: "",
    address: "",
  });

  useEffect(() => {
    fetch("/api/operators/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.operator) {
          setForm({
            company_name: data.operator.company_name || "",
            email: data.operator.email || "",
            phone: data.operator.phone || "",
            description: data.operator.description || "",
            website: data.operator.website || "",
            address: data.operator.address || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/operators/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // ignore
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Impostazioni</h1>
          <p className="text-gray-500 mt-1">Gestisci il profilo della tua azienda</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#D4A843] hover:bg-[#c09535] text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Salvataggio..." : saved ? "✓ Salvato" : "Salva"}
        </button>
      </div>

      {/* Logo Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-[#1B2A4A] mb-4">Logo Azienda</h2>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#1B2A4A]/10 flex items-center justify-center">
            <span className="text-3xl font-heading font-bold text-[#D4A843]">
              {form.company_name.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <button className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
              <Upload className="w-4 h-4" />
              Carica logo
            </button>
            <p className="text-xs text-gray-400 mt-1.5">PNG o JPG, max 2MB</p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-[#1B2A4A] mb-2">Informazioni Azienda</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Azienda</label>
          <input
            type="text"
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50 focus:border-[#D4A843]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50 focus:border-[#D4A843]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50 focus:border-[#D4A843]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descrivi la tua azienda e le esperienze che offri..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50 focus:border-[#D4A843] resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sito Web</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50 focus:border-[#D4A843]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Via Roma 1, Sorrento..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50 focus:border-[#D4A843]"
            />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 bg-white rounded-2xl border border-red-200 p-6">
        <h2 className="font-semibold text-red-700 mb-2">Zona Pericolosa</h2>
        <p className="text-sm text-gray-500 mb-4">
          Queste azioni sono irreversibili. Procedi con cautela.
        </p>
        <button className="text-sm bg-red-50 text-red-700 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Disattiva Account
        </button>
      </div>
    </div>
  );
}
