"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Star, Heart, Settings, Users,
  MapPin, ShoppingBag, CreditCard, BarChart3, FileText,
  MessageSquare, LogOut, ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  role: "tourist" | "operator" | "admin";
  userName?: string;
}

const touristNav: NavItem[] = [
  { href: "/dashboard/tourist", label: "Le Mie Prenotazioni", icon: Calendar },
  { href: "/dashboard/tourist/favorites", label: "Tour Salvati", icon: Heart },
  { href: "/dashboard/tourist/reviews", label: "Le Mie Recensioni", icon: Star },
  { href: "/dashboard/tourist/settings", label: "Impostazioni", icon: Settings },
];

const operatorNav: NavItem[] = [
  { href: "/dashboard/operator", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/operator/tours", label: "I Miei Tour", icon: MapPin },
  { href: "/dashboard/operator/bookings", label: "Prenotazioni", icon: Calendar },
  { href: "/dashboard/operator/reviews", label: "Recensioni", icon: Star },
  { href: "/dashboard/operator/kyc", label: "Verifica KYC", icon: CreditCard },
  { href: "/dashboard/operator/settings", label: "Impostazioni", icon: Settings },
];

const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/operators", label: "Operatori", icon: Users },
  { href: "/dashboard/admin/tours", label: "Tour", icon: MapPin },
  { href: "/dashboard/admin/bookings", label: "Prenotazioni", icon: Calendar },
  { href: "/dashboard/admin/shops", label: "Shop & QR", icon: ShoppingBag },
  { href: "/dashboard/admin/transactions", label: "Transazioni", icon: CreditCard },
  { href: "/dashboard/admin/reviews", label: "Recensioni", icon: MessageSquare },
  { href: "/dashboard/admin/users", label: "Utenti", icon: Users },
  { href: "/dashboard/admin/logs", label: "Audit Log", icon: FileText },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const navMap = { tourist: touristNav, operator: operatorNav, admin: adminNav };
const roleLabel = { tourist: "Turista", operator: "Operatore", admin: "Admin" };
const roleColor = { tourist: "bg-blue-100 text-blue-800", operator: "bg-[#D4A843]/20 text-[#D4A843]", admin: "bg-red-100 text-red-800" };

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const items = navMap[role];

  return (
    <aside className="w-64 bg-[#1B2A4A] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="block">
          <h1 className="text-[#D4A843] font-bold text-lg tracking-wide">Trust the Local</h1>
          <p className="text-white/40 text-xs tracking-widest mt-0.5">COSTIERA AMALFITANA</p>
        </Link>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#D4A843]/20 flex items-center justify-center text-[#D4A843] font-bold text-sm">
            {userName?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{userName || "Utente"}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor[role]}`}>{roleLabel[role]}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== `/dashboard/${role}` && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                active
                  ? "bg-[#D4A843] text-[#1B2A4A] font-semibold"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Torna al Sito
        </Link>
      </div>
    </aside>
  );
}
