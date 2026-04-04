"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Availability {
  pk: number;
  start_at: string;
  end_at: string;
  capacity: number;
  available_capacity: number;
  price: number;
}

interface AvailabilityPickerProps {
  tourId: string;
  selectedDate: string;
  onSelect: (availability: Availability) => void;
}

export function AvailabilityPicker({
  tourId,
  selectedDate,
  onSelect,
}: AvailabilityPickerProps) {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPk, setSelectedPk] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);
    setSelectedPk(null);

    fetch(`/api/tours/${tourId}/availabilities?date=${selectedDate}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load availabilities");
        return res.json();
      })
      .then((data) => setAvailabilities(data.availabilities || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tourId, selectedDate]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (availabilities.length === 0 && selectedDate) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        Nessuna disponibilità per questa data.
      </p>
    );
  }

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-2">
      {availabilities.map((av) => (
        <Button
          key={av.pk}
          variant={selectedPk === av.pk ? "default" : "outline"}
          className="w-full justify-between h-auto py-3 px-4"
          disabled={av.available_capacity <= 0}
          onClick={() => {
            setSelectedPk(av.pk);
            onSelect(av);
          }}
        >
          <span className="font-medium">
            {formatTime(av.start_at)} - {formatTime(av.end_at)}
          </span>
          <Badge
            variant={av.available_capacity > 5 ? "secondary" : "destructive"}
          >
            {av.available_capacity > 0
              ? `${av.available_capacity} posti`
              : "Esaurito"}
          </Badge>
        </Button>
      ))}
    </div>
  );
}
