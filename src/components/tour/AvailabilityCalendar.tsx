"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Loader2 } from "lucide-react";

interface AvailabilityCalendarProps {
  tourId: string;
}

interface DayAvailability {
  id?: string;
  date: string;
  time_slots: string[];
  max_guests: number;
  booked_guests: number;
  blocked: boolean;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

export function AvailabilityCalendar({ tourId }: AvailabilityCalendarProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editSlots, setEditSlots] = useState<string[]>([]);
  const [editMaxGuests, setEditMaxGuests] = useState(10);
  const [editBlocked, setEditBlocked] = useState(false);
  const [newSlot, setNewSlot] = useState("09:00");

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tours/${tourId}/availability?month=${year}-${String(month + 1).padStart(2, "0")}`
      );
      if (res.ok) {
        const data = await res.json();
        setAvailability(data.availability || []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [tourId, year, month]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => {
    const d = new Date(y, m, 1).getDay();
    return d === 0 ? 6 : d - 1; // Mon=0
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = new Date().toISOString().split("T")[0];

  const availMap = new Map<string, DayAvailability>();
  availability.forEach((a) => availMap.set(a.date, a));

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  const selectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = availMap.get(dateStr);
    if (existing) {
      setEditSlots(existing.time_slots);
      setEditMaxGuests(existing.max_guests);
      setEditBlocked(existing.blocked);
    } else {
      setEditSlots(["09:00", "14:00"]);
      setEditMaxGuests(10);
      setEditBlocked(false);
    }
  };

  const addSlot = () => {
    if (!editSlots.includes(newSlot)) {
      setEditSlots([...editSlots, newSlot].sort());
    }
  };

  const removeSlot = (slot: string) => {
    setEditSlots(editSlots.filter((s) => s !== slot));
  };

  const saveAvailability = async () => {
    if (!selectedDate) return;
    setSaving(true);
    try {
      await fetch(`/api/tours/${tourId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time_slots: editSlots,
          max_guests: editMaxGuests,
          blocked: editBlocked,
        }),
      });
      await fetchAvailability();
      setSelectedDate(null);
    } catch {
      // ignore
    }
    setSaving(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-heading font-semibold text-[#1B2A4A]">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for first week */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const avail = availMap.get(dateStr);
              const isPast = dateStr < today;
              const isSelected = dateStr === selectedDate;

              let bgClass = "bg-white hover:bg-gray-50 border border-gray-100";
              if (isPast) bgClass = "bg-gray-50 text-gray-300 cursor-not-allowed";
              else if (avail?.blocked) bgClass = "bg-red-50 border border-red-200 text-red-400";
              else if (avail && avail.time_slots.length > 0) bgClass = "bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100";
              else bgClass = "bg-white border border-gray-100 cursor-pointer hover:bg-gray-50";

              if (isSelected) bgClass = "bg-[#D4A843] text-white border border-[#D4A843] ring-2 ring-[#D4A843]/30";

              return (
                <button
                  key={dateStr}
                  disabled={isPast}
                  onClick={() => !isPast && selectDate(dateStr)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${bgClass}`}
                >
                  <span className={`font-medium ${isSelected ? "text-white" : ""}`}>{day}</span>
                  {avail && !isPast && !isSelected && (
                    <span className="text-[10px] mt-0.5">
                      {avail.blocked ? "🚫" : `${avail.time_slots.length} slot`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-200" />
            Disponibile
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-50 border border-red-200" />
            Bloccato
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-50 border border-gray-200" />
            Non configurato
          </div>
        </div>
      </div>

      {/* Edit Panel */}
      <div className="lg:col-span-2">
        {selectedDate ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-[#1B2A4A]">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              <button onClick={() => setSelectedDate(null)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Block toggle */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-4">
              <span className="text-sm font-medium text-gray-700">Blocca giorno</span>
              <button
                onClick={() => setEditBlocked(!editBlocked)}
                className={`relative w-10 h-5 rounded-full transition-colors ${editBlocked ? "bg-red-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${editBlocked ? "translate-x-5" : ""}`} />
              </button>
            </div>

            {!editBlocked && (
              <>
                {/* Max guests */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Max ospiti</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editMaxGuests}
                    onChange={(e) => setEditMaxGuests(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50"
                  />
                </div>

                {/* Time slots */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 block mb-2">Fasce orarie</label>
                  <div className="space-y-2">
                    {editSlots.map((slot) => (
                      <div key={slot} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-green-800">🕐 {slot}</span>
                        <button onClick={() => removeSlot(slot)} className="text-red-400 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <input
                      type="time"
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50"
                    />
                    <button
                      onClick={addSlot}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#1B2A4A] text-white text-sm hover:bg-[#1B2A4A]/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Aggiungi
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Save */}
            <button
              onClick={saveAvailability}
              disabled={saving}
              className="w-full rounded-lg bg-[#D4A843] text-white py-2.5 text-sm font-semibold hover:bg-[#c09535] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Salvataggio..." : "Salva Disponibilità"}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#D4A843]/10 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-[#D4A843]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-[#1B2A4A]">Seleziona una data</h3>
            <p className="text-sm text-gray-500 mt-1">Clicca su un giorno del calendario per configurare la disponibilità</p>
          </div>
        )}
      </div>
    </div>
  );
}
