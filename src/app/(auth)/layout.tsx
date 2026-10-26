import React from "react";
import Link from "next/link";
import { Layers, ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#f7f9ff] text-[#181c20] flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Ambient Atmospheric Blooms */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-96 h-96 rounded-full bg-[#e2dfff] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-[#ffdad3] opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-[#dce2f7] opacity-40 blur-2xl" />

      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10 pb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-[#5046e5] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-['Space_Grotesk'] font-bold text-base tracking-tight text-[#181c20]">
              Eidetic
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#fb603f]" />
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#777587] hover:text-[#5046e5] transition-colors bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#e0e2e8]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
      </header>

      {/* Center Auth Card */}
      <main className="w-full flex-1 flex items-center justify-center z-10 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center font-['Inter'] text-xs text-[#777587] z-10 pt-4">
        © {new Date().getFullYear()} Eidetic AI Studio. Cryptographic tenant isolation & active brand governance.
      </footer>
    </div>
  );
}
