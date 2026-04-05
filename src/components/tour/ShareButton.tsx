"use client";

import { useState } from "react";
import { Share2, MessageCircle, Link2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  url?: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  function shareWhatsApp() {
    const text = encodeURIComponent(`Guarda questa esperienza su Trust the Local: ${title} - ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setOpen(false);
  }

  function shareFacebook() {
    const encoded = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, "_blank");
    setOpen(false);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 2000);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:border-[#D4A843] hover:text-[#D4A843] text-sm font-medium transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Condividi
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[180px]">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Condividi</p>
            </div>
            <button
              onClick={shareWhatsApp}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-green-500" />
              WhatsApp
            </button>
            <button
              onClick={shareFacebook}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="w-4 h-4 text-blue-600 font-bold text-sm flex items-center justify-center">f</span>
              Facebook
            </button>
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <><Check className="w-4 h-4 text-green-500" /><span className="text-green-600">Link copiato!</span></>
              ) : (
                <><Link2 className="w-4 h-4 text-gray-500" />Copia Link</>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
