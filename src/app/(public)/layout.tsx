import { Suspense } from "react";
import { ShopTracker } from "@/components/tracking/ShopTracker";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import Link from "next/link";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Suspense fallback={null}>
        <ShopTracker />
      </Suspense>

      {/* Header - Deep Navy */}
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

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
            >
              Home
            </Link>
            <Link
              href="/esperienze"
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
            >
              Esperienze
            </Link>
            <Link
              href="/dashboard/tourist"
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
            >
              Le Mie Prenotazioni
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-gold px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-white"
            >
              Operatori
            </Link>
          </nav>

          {/* Language Switcher + Mobile menu */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button className="sm:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {children}
      </main>

      {/* Maiolica Band */}
      <div className="maiolica-band" />

      {/* Footer - Dark */}
      <footer className="bg-navy-dark text-white py-12">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gold">
                  <svg className="h-4 w-4 text-gold" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z" />
                  </svg>
                </div>
                <span className="text-lg font-heading font-bold">Trust the Local</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Esperienze autentiche in Costiera Amalfitana con guide locali appassionate. La dolce vita inizia qui.
              </p>
            </div>

            {/* Esperienze */}
            <div>
              <h4 className="font-heading font-semibold text-gold mb-4">Esperienze</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Tour della Costiera</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Gite in Barca</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Food &amp; Limoncello</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Transfer Privati</Link></li>
              </ul>
            </div>

            {/* Contatti */}
            <div>
              <h4 className="font-heading font-semibold text-gold mb-4">Contatti</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  +39 089 123 456
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  info@trustthelocal.it
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Costiera Amalfitana
                </li>
              </ul>
            </div>

            {/* Informazioni */}
            <div>
              <h4 className="font-heading font-semibold text-gold mb-4">Informazioni</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Chi Siamo</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Termini e Condizioni</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Politica di Cancellazione</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-10 pt-6 border-t border-white/10 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Trust the Local &middot; Costiera Amalfitana &middot; ☀️ La dolce vita inizia qui
          </div>
        </div>
      </footer>
    </div>
  );
}
