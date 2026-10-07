import React from "react";
import Link from "next/link";
import { Cpu } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#0c0e12] text-[#eef1f7] flex flex-col justify-between p-6 relative overflow-hidden select-none optical-grid">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10 pb-4 border-b border-[#232936]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-[2px] bg-[#1e2024] border border-[#333842] flex items-center justify-center">
            <Cpu className="w-3 h-3 text-[#eef1f7]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs tracking-[0.25em] text-[#eef1f7] font-semibold uppercase">
              EIDETIC
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.9)]" />
          </div>
        </Link>

        <Link
          href="/"
          className="font-mono text-[10px] uppercase text-[#8f9194] hover:text-[#eef1f7] transition-colors flex items-center gap-1"
        >
          ← HOME
        </Link>
      </header>

      {/* Center Box */}
      <main className="w-full flex-1 flex items-center justify-center z-10 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center font-mono text-[9px] text-[#8f9194] z-10 pt-4 border-t border-[#232936]">
        EIDETIC AUTHENTICATION MATRIX // SUPABASE ENCRYPTION & RLS PROTECTED
      </footer>
    </div>
  );
}
