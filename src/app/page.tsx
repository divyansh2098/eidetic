"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Palette, MessageSquare, Download, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(Boolean(data.session?.user));
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20] font-sans antialiased selection:bg-[#5046e5] selection:text-white flex flex-col">
      {/* FIXED TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(80,70,229,0.06)] z-50 transition-all border-b border-[#e0e2e8]">
        <div className="max-w-7xl mx-auto h-16 px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-[#5046e5] flex items-center justify-center text-white shadow-[0_4px_12px_-2px_rgba(80,70,229,0.35)] group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="font-['Space_Grotesk'] font-bold text-xl tracking-tight text-[#181c20]">
                Eidetic
              </span>
            </Link>

            <div className="h-4 w-px bg-[#e0e2e8] hidden md:block" />

            <nav className="hidden md:flex items-center gap-1.5">
              <Link
                href="/studio"
                className="text-[#464555] hover:text-[#181c20] hover:bg-[#f1f3f9] px-4 py-1.5 rounded-full font-['Space_Grotesk'] font-semibold text-xs transition-all"
              >
                Studio Canvas
              </Link>
              <Link
                href="/studio?tab=dna"
                className="text-[#464555] hover:text-[#181c20] hover:bg-[#f1f3f9] px-4 py-1.5 rounded-full font-['Space_Grotesk'] font-semibold text-xs transition-all"
              >
                Brand DNA
              </Link>
              <Link
                href="/studio?tab=assets"
                className="text-[#464555] hover:text-[#181c20] hover:bg-[#f1f3f9] px-4 py-1.5 rounded-full font-['Space_Grotesk'] font-semibold text-xs transition-all"
              >
                Asset Archive
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={isAuthenticated ? "/studio" : "/login"}
              className="h-9 px-5 rounded-full bg-[#5046e5] hover:bg-[#4338ca] text-white font-['Space_Grotesk'] text-xs font-semibold shadow-[0_4px_14px_rgba(80,70,229,0.3)] transition-all flex items-center gap-1.5"
            >
              <span>{isAuthenticated ? "Enter Studio" : "Sign In"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full pt-16 flex-1">
        {/* HERO SECTION */}
        <section className="relative w-full overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-[#e2dfff]/50 blur-3xl pointer-events-none" />
          <div className="absolute top-48 right-0 w-[500px] h-[500px] rounded-full bg-[#ffdad3]/40 blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Copy & Actions */}
              <div className="lg:col-span-7 flex flex-col items-start space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e2dfff] text-[#3422cc] shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#5046e5]" />
                  <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
                    AI Graphic Design For Your Brand
                  </span>
                </div>

                <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#181c20] leading-[1.1]">
                  Brand graphics that look like{" "}
                  <span className="text-[#5046e5] inline-block">you made them.</span>
                </h1>

                <p className="text-lg text-[#464555] max-w-xl leading-relaxed">
                  Configure your brand logo, colors, typography, and tone of voice once. Then generate social graphics, posters, and marketing assets tailored to your brand identity.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/studio"
                    className="h-12 px-8 rounded-full bg-[#5046e5] hover:bg-[#4338ca] text-white font-['Space_Grotesk'] text-sm font-semibold transition-all shadow-[0_8px_20px_-4px_rgba(80,70,229,0.35)] flex items-center gap-2 group"
                  >
                    <span>Open Studio Canvas</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href="/studio?tab=dna"
                    className="h-12 px-7 rounded-full bg-white hover:bg-[#f1f3f9] text-[#181c20] font-['Space_Grotesk'] text-sm font-semibold transition-all shadow-sm border border-[#e0e2e8] flex items-center gap-2"
                  >
                    <Palette className="w-4 h-4 text-[#5046e5]" />
                    <span>Set Up Brand DNA</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Preview Card */}
              <div className="lg:col-span-5 relative w-full flex justify-center">
                <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-3xl bg-[#5046e5] p-6 flex flex-col justify-between text-white shadow-[0_20px_50px_-10px_rgba(80,70,229,0.35)] overflow-hidden">
                  <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-[#fb603f] opacity-80" />

                  {/* Card Top */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="font-mono text-xs tracking-wider text-[#dbd8ff] uppercase font-bold">
                      Brand Canvas Preview
                    </span>
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white font-mono text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#fb603f]" />
                      <span>Live Sync</span>
                    </div>
                  </div>

                  {/* Card Center */}
                  <div className="relative z-10 my-auto py-6">
                    <div className="w-10 h-1 bg-[#fb603f] rounded-full mb-4" />
                    <h2 className="font-['Space_Grotesk'] text-3xl font-bold leading-tight tracking-tight text-white">
                      Consistent graphics at scale
                    </h2>
                    <p className="text-sm text-[#dbd8ff] mt-2 leading-relaxed">
                      Every output automatically includes your chosen color palette, typography guidelines, and anchored brand logo.
                    </p>
                  </div>

                  {/* Card Bottom */}
                  <div className="relative z-10 flex items-center justify-between pt-3 bg-white/10 rounded-2xl p-3 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white font-semibold">Multiple Ratios</span>
                      <span className="text-[#dbd8ff] text-xs">· 1:1, 4:5, 9:16, 16:9</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 STEPS WORKFLOW */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 border-t border-[#e0e2e8]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs uppercase text-[#5046e5] font-bold tracking-wider block mb-2">
              Workflow
            </span>
            <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-[#181c20] tracking-tight">
              Create on-brand graphics in three steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-[#e0e2e8]">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#5046e5] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-base mb-5">
                  1
                </div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#181c20] mb-2">
                  Set Up Brand DNA
                </h3>
                <p className="text-sm text-[#464555] leading-relaxed">
                  Upload your brand logo, pick your primary and secondary palette colors, select tone of voice, and choose logo watermark placement.
                </p>
              </div>
              <div className="mt-6 pt-4 bg-[#f1f3f9] rounded-2xl p-3 flex items-center justify-between">
                <span className="font-mono text-xs text-[#464555]">Logo & Palette</span>
                <Palette className="w-4 h-4 text-[#5046e5]" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-[#e0e2e8]">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#5046e5] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-base mb-5">
                  2
                </div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#181c20] mb-2">
                  Describe Your Graphic
                </h3>
                <p className="text-sm text-[#464555] leading-relaxed">
                  Enter your concept in plain English and select an aspect ratio preset (1:1 Square, 4:5 Portrait, 9:16 Story, or 16:9 Banner).
                </p>
              </div>
              <div className="mt-6 pt-4 bg-[#f1f3f9] rounded-2xl p-3 flex items-center justify-between">
                <span className="font-mono text-xs text-[#464555]">Natural Language</span>
                <MessageSquare className="w-4 h-4 text-[#5046e5]" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-[#e0e2e8]">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#5046e5] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-base mb-5">
                  3
                </div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#181c20] mb-2">
                  Refine & Download
                </h3>
                <p className="text-sm text-[#464555] leading-relaxed">
                  Refine the image via conversation. Download high-resolution PNGs to use across your marketing channels.
                </p>
              </div>
              <div className="mt-6 pt-4 bg-[#f1f3f9] rounded-2xl p-3 flex items-center justify-between">
                <span className="font-mono text-xs text-[#464555]">Instant Export</span>
                <Download className="w-4 h-4 text-[#5046e5]" />
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-16">
          <div className="relative w-full rounded-3xl bg-[#5046e5] text-white p-8 lg:p-12 overflow-hidden shadow-lg shadow-[#5046e5]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-['Space_Grotesk'] text-2xl lg:text-3xl font-bold tracking-tight text-white">
                Ready to generate on-brand graphics?
              </h2>
              <p className="text-sm text-[#dbd8ff] mt-1">
                Open the studio canvas and start creating immediately.
              </p>
            </div>
            <Link
              href="/studio"
              className="h-11 px-6 rounded-full bg-white hover:bg-[#f1f3f9] text-[#5046e5] font-['Space_Grotesk'] text-xs font-semibold flex items-center gap-2 transition-all shrink-0"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-[#e0e2e8] py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#464555]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#5046e5] flex items-center justify-center text-white">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-['Space_Grotesk'] font-bold text-sm text-[#181c20]">Eidetic</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/studio" className="hover:text-[#181c20] transition-colors">
              Studio
            </Link>
            <Link href="/studio?tab=dna" className="hover:text-[#181c20] transition-colors">
              Brand DNA
            </Link>
            <Link href="/studio?tab=assets" className="hover:text-[#181c20] transition-colors">
              Asset Archive
            </Link>
          </div>

          <div>
            © {new Date().getFullYear()} Eidetic. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
