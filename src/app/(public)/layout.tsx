import { Suspense } from "react";
import { ShopTracker } from "@/components/tracking/ShopTracker";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Suspense fallback={null}>
        <ShopTracker />
      </Suspense>

      <PublicHeader />

      {/* Main */}
      <main className="flex-1">
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
