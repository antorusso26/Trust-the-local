import { type ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  color?: "gold" | "navy" | "green" | "blue";
}

const colors = {
  gold: "bg-[#D4A843]/10 text-[#D4A843]",
  navy: "bg-[#1B2A4A]/10 text-[#1B2A4A]",
  green: "bg-green-50 text-green-600",
  blue: "bg-blue-50 text-blue-600",
};

export function StatsCard({ title, value, subtitle, icon, trend, color = "gold" }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#1B2A4A] mt-1">{value}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend.value >= 0 ? "text-green-600" : "text-red-500"}`}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
