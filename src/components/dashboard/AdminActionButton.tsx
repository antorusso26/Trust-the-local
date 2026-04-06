"use client";

import { useState } from "react";

interface AdminActionButtonProps {
  targetId: string;
  targetType: "operator" | "review" | "tour";
  action: string;
  label: string;
  color: "green" | "red" | "yellow" | "blue";
  confirmMessage?: string;
}

const colorMap = {
  green: "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white",
  red: "bg-red-50 text-red-700 hover:bg-red-600 hover:text-white",
  yellow: "bg-yellow-50 text-yellow-700 hover:bg-yellow-600 hover:text-white",
  blue: "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white",
};

export function AdminActionButton({
  targetId,
  targetType,
  action,
  label,
  color,
  confirmMessage,
}: AdminActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleClick = async () => {
    if (confirmMessage && !confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin",
        },
        body: JSON.stringify({ action, target_id: targetId, target_type: targetType }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => window.location.reload(), 500);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  if (done) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600 font-medium">
        ✓ Fatto
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-50 ${colorMap[color]}`}
    >
      {loading ? "..." : label}
    </button>
  );
}
