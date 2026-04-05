"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface FavoriteButtonProps {
  tourId: string;
  initialFavorited?: boolean;
  className?: string;
}

export function FavoriteButton({ tourId, initialFavorited = false, className = "" }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tour_id: tourId }),
    });

    if (res.ok) {
      const data = await res.json();
      setFavorited(data.favorited);
    } else if (res.status === 401) {
      // Redirect to login
      window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      className={`transition-all active:scale-90 ${loading ? "opacity-50" : ""} ${className}`}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          favorited ? "fill-red-500 text-red-500" : "text-white fill-transparent stroke-white"
        }`}
      />
    </button>
  );
}
