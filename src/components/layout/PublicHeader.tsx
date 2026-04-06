"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/i18n/TranslationProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export function PublicHeader() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy text-white">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold">
            <svg className="h-5 w-5 text-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-heading font-bold tracking-tight">Trust the Local</span>
            <span className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-gold">
              Costiera Amalfitana
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
          >
            {t("nav.home", "Home")}
          </Link>
          <Link
            href="/esperienze"
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
          >
            {t("nav.experiences", "Esperienze")}
          </Link>
          <Link
            href="/dashboard/tourist"
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
          >
            {t("nav.bookings", "Le Mie Prenotazioni")}
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-gold px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-white"
          >
            {t("nav.login", "Operatori")}
          </Link>
        </nav>

        {/* Language Switcher + Mobile menu button */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-navy-dark animate-in slide-in-from-top-2">
          <nav className="flex flex-col px-4 py-4 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10"
            >
              {t("nav.home", "Home")}
            </Link>
            <Link
              href="/esperienze"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10"
            >
              {t("nav.experiences", "Esperienze")}
            </Link>
            <Link
              href="/dashboard/tourist"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10"
            >
              {t("nav.bookings", "Le Mie Prenotazioni")}
            </Link>
            <div className="pt-2 border-t border-white/10 mt-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg border border-gold px-4 py-3 text-sm font-medium text-gold text-center transition-colors hover:bg-gold hover:text-white"
              >
                {t("nav.login", "Operatori")}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
