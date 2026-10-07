"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowUpRight,
  Cpu,
  Terminal
} from "lucide-react";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // References for scroll reveal tracking
  const heroRef = useRef<HTMLDivElement>(null);
  const monolithRef = useRef<HTMLDivElement>(null);
  const presetsRef = useRef<HTMLDivElement>(null);
  const unitsRef = useRef<HTMLDivElement>(null);
  const benchmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Track window scroll progress for telemetry bar & parallax
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for fallback scroll reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const elementsToObserve = document.querySelectorAll(".reveal-item");
    elementsToObserve.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0e12] text-[#eef1f7] flex flex-col selection:bg-[#4edea3] selection:text-black optical-grid relative">
      {/* Scroll Progress Telemetry Wire (Top of Screen) */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-[#1e2024] z-[60] pointer-events-none">
        <div
          className="h-full bg-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.9)] transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Hardware Rail */}
      <header className="w-full border-b border-[#232936] bg-[#0c0e12]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-[2px] bg-[#1e2024] border border-[#333842] flex items-center justify-center shadow-inner">
              <Cpu className="w-3 h-3 text-[#eef1f7]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs tracking-[0.25em] text-[#eef1f7] font-semibold uppercase">
                EIDETIC
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.9)]" />
            </div>
          </Link>

          {/* Telemetry Scroll Indicator in Header */}
          <div className="hidden md:flex items-center gap-3 font-mono text-[9px] text-[#8f9194]">
            <span>ENGINE: FP16-TURBO</span>
            <span>•</span>
            <span>
              TELEMETRY: <span className="text-[#4edea3]">{Math.round(scrollProgress)}%</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                href="/studio"
                className="h-8 px-4 rounded-[2px] bg-[#eef1f7] hover:bg-white text-[#0c0e12] font-mono text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1.5 border border-white/20 active:translate-y-[1px] transition-all shadow-sm"
              >
                OPEN STUDIO
                <ArrowUpRight className="w-3 h-3 font-bold" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-7 px-3 rounded-[1px] font-mono text-[10px] uppercase tracking-wider text-[#8f9194] hover:text-[#eef1f7] hover:bg-[#16181d] flex items-center transition-colors"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/signup"
                  className="h-7 px-3.5 rounded-[1px] bg-[#1e2024] hover:bg-[#282a2e] text-[#eef1f7] border border-[#333842] font-mono text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1 active:translate-y-[1px] transition-all"
                >
                  CALIBRATE
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Exhibition Hero */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">
        {/* Registration crosshair tags (Hero entrance) */}
        <div
          ref={heroRef}
          className="reveal-item is-visible sda-reveal inline-flex items-center gap-2 px-3 py-1 rounded-[1px] bg-[#111317] border border-[#232936] font-mono text-[9px] uppercase tracking-widest text-[#8f9194] mb-6 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_4px_rgba(78,222,163,0.9)]" />
          <span>SPECIFICATION // PRECISION AI BRAND ENGINE</span>
        </div>

        {/* Primary Headline */}
        <h1 className="reveal-item is-visible sda-reveal text-3xl sm:text-5xl font-semibold text-[#eef1f7] tracking-tight leading-tight max-w-2xl font-sans">
          Graphics calibrated strictly to your brand DNA.
        </h1>

        {/* Subtitle */}
        <p className="reveal-item is-visible sda-reveal mt-4 text-xs sm:text-sm text-[#8f9194] max-w-lg leading-relaxed font-mono">
          Tactile industrial hardware aesthetic with zero visual drift. Lock your colors, typography, and logo quadrant anchors. Direct through conversational synthesis.
        </p>

        {/* Tactile Action Buttons */}
        <div className="reveal-item is-visible sda-reveal mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={isAuthenticated ? "/studio" : "/signup"}
            className="w-full sm:w-auto h-10 px-6 rounded-[2px] bg-[#eef1f7] hover:bg-white text-[#0c0e12] font-mono text-xs uppercase font-semibold tracking-wider flex items-center justify-center gap-2 border border-white/20 shadow-lg active:translate-y-[1px] transition-all"
          >
            {isAuthenticated ? "OPEN STUDIO CANVAS" : "CALIBRATE WORKSPACE"}
            <ArrowUpRight className="w-3.5 h-3.5 font-bold" />
          </Link>
          {!isAuthenticated && (
            <Link
              href="/login"
              className="w-full sm:w-auto h-10 px-6 rounded-[2px] bg-[#111317] hover:bg-[#16181d] text-[#c5c6ca] hover:text-[#eef1f7] border border-[#232936] font-mono text-xs uppercase tracking-wider flex items-center justify-center transition-colors"
            >
              AUTHENTICATE EXISTING SPEC
            </Link>
          )}
        </div>

        {/* Precision Hero Monolith Display (Scroll-Revealed with Depth Zoom) */}
        <div
          ref={monolithRef}
          className="reveal-item sda-zoom mt-14 w-full max-w-3xl relative"
        >
          <div className="machined-plate rounded-lg p-3 bg-[#111317] transform transition-transform duration-300">
            {/* Top specular edge */}
            <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            {/* Corner registration crop marks */}
            <div className="absolute top-5 left-5 font-mono text-[11px] text-[#eef1f7] opacity-60 pointer-events-none">
              +
            </div>
            <div className="absolute top-5 right-5 font-mono text-[11px] text-[#eef1f7] opacity-60 pointer-events-none">
              +
            </div>
            <div className="absolute bottom-12 left-5 font-mono text-[11px] text-[#eef1f7] opacity-60 pointer-events-none">
              +
            </div>
            <div className="absolute bottom-12 right-5 font-mono text-[11px] text-[#eef1f7] opacity-60 pointer-events-none">
              +
            </div>

            {/* Visual Viewport */}
            <div className="relative w-full aspect-[16/9] bg-[#0c0e12] rounded-[2px] overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] border border-black/50 flex flex-col justify-between p-6 group">
              <div className="flex justify-between items-start font-mono text-[9px] text-[#8f9194]">
                <div>
                  <p>┌ + REG_01 [NW]</p>
                  <p className="text-[8px] text-[#4edea3]">OPTICAL: SUMMILUX 50mm</p>
                </div>
                <div className="text-right">
                  <p>+ ┐ REG_02 [NE]</p>
                  <p className="text-[8px]">ISO 100 RAW</p>
                </div>
              </div>

              <div className="max-w-md mx-auto text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#1e2024] border border-[#333842] flex items-center justify-center mx-auto text-[#4edea3] shadow-inner">
                  <Terminal className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-[#eef1f7]">
                  &ldquo;Brushed titanium monolith & volcanic stone pedestal, surgical studio key light.&rdquo;
                </p>
                <div className="flex items-center justify-center gap-1.5 font-mono text-[9px] text-[#4edea3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_4px_rgba(78,222,163,0.9)]" />
                  <span>BRAND DNA MATRIX: CALIBRATED (100%)</span>
                </div>
              </div>

              <div className="flex justify-between items-end font-mono text-[9px] text-[#8f9194]">
                <p>└ + REG_03 [SW]</p>
                <p>+ ┘ REG_04 [SE]</p>
              </div>
            </div>

            {/* Milled Console Carrier Readout */}
            <div className="mt-2.5 px-3 py-1.5 flex items-center justify-between bg-[#0c0e12] border border-[#232936] rounded-[2px] font-mono text-[9px] text-[#8f9194]">
              <div className="flex items-center gap-3">
                <span>PIPELINE: EIDETIC-FP16-TURBO</span>
                <span>•</span>
                <span>LATENCY: 14ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                <span className="text-[#4edea3]">SYSTEM ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll-Driven Optical Preset Rocker Showcase */}
        <div
          ref={presetsRef}
          className="reveal-item sda-reveal mt-16 w-full max-w-3xl flex flex-col items-center gap-2"
        >
          <div className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194] flex items-center gap-2">
            <span>CALIBRATED FORMAT SELECTORS</span>
            <span className="text-[#333842]">•</span>
            <span className="text-[#4edea3]">1-CLICK RESIZING</span>
          </div>
          <div className="flex items-center bg-[#111317] p-1 rounded-[2px] border border-[#232936] shadow-md w-full justify-between sm:justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            <span className="font-mono text-[10px] px-2.5 py-1 bg-[#1e2024] text-[#eef1f7] border border-[#333842] rounded-[1px] flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
              1:1 SQUARE (FEED)
            </span>
            <span className="font-mono text-[10px] px-2 py-1 text-[#8f9194] hover:text-[#eef1f7] rounded-[1px]">
              9:16 VERTICAL (STORY)
            </span>
            <span className="font-mono text-[10px] px-2 py-1 text-[#8f9194] hover:text-[#eef1f7] rounded-[1px]">
              16:9 BANNER (DISPLAY)
            </span>
            <span className="font-mono text-[10px] px-2 py-1 text-[#8f9194] hover:text-[#eef1f7] rounded-[1px]">
              4:5 PORTRAIT
            </span>
          </div>
        </div>

        {/* Scroll-Revealed Telemetry Benchmark: Unregulated vs Calibrated */}
        <div
          ref={benchmarkRef}
          className="reveal-item sda-reveal mt-16 w-full max-w-3xl bg-[#111317] border border-[#232936] rounded-lg p-5 text-left relative"
        >
          <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#8f9194] uppercase tracking-wider">
              <span>BENCHMARK // ARCHITECTURAL FIDELITY</span>
            </div>
            <span className="font-mono text-[9px] text-[#4edea3] uppercase font-semibold">
              0% DRIFT TOLERANCE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {/* Left: Standard AI */}
            <div className="bg-[#0c0e12] p-3 rounded-[2px] border border-[#232936] space-y-2 font-mono text-[10px]">
              <div className="text-[#ffb4ab] uppercase font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]" />
                UNREGULATED AI ENGINES
              </div>
              <ul className="space-y-1 text-[#8f9194] text-[9px]">
                <li>✕ Hallucinates generic neon blues & random accents</li>
                <li>✕ Ignores brand typography guidelines</li>
                <li>✕ Distorts or completely omits logo placement</li>
                <li>✕ Constant prompt re-typing and aesthetic drift</li>
              </ul>
            </div>

            {/* Right: Eidetic Matrix */}
            <div className="bg-[#16181d] p-3 rounded-[2px] border border-[#4edea3] space-y-2 font-mono text-[10px] relative shadow-lg">
              <div className="text-[#4edea3] uppercase font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.9)]" />
                EIDETIC PRECISION MATRIX
              </div>
              <ul className="space-y-1 text-[#c5c6ca] text-[9px]">
                <li>✓ Strict 5-layer system prompt mathematical seeding</li>
                <li>✓ Exact hex palette injection (#10B981, #111317)</li>
                <li>✓ Precise 4-quadrant watermark placement</li>
                <li>✓ Conversational state memory across all sessions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3 Core Capabilities (Staggered Scroll Entrance) */}
        <div
          ref={unitsRef}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left"
        >
          {/* Unit 01 */}
          <div className="reveal-item reveal-delay-1 sda-reveal p-4 rounded-lg bg-[#111317] border border-[#232936] space-y-2 relative shadow-md">
            <div className="flex items-center justify-between font-mono text-[9px] text-[#8f9194]">
              <span>UNIT 01</span>
              <span className="text-[#4edea3]">LOCKED</span>
            </div>
            <h2 className="text-sm font-medium text-[#eef1f7] tracking-tight">
              Brand DNA Specification
            </h2>
            <p className="font-mono text-[10px] text-[#8f9194] leading-relaxed">
              Hex color matrices, typography rules, and logo quadrant anchors mathematically injected into every generation prompt.
            </p>
          </div>

          {/* Unit 02 */}
          <div className="reveal-item reveal-delay-2 sda-reveal p-4 rounded-lg bg-[#111317] border border-[#232936] space-y-2 relative shadow-md">
            <div className="flex items-center justify-between font-mono text-[9px] text-[#8f9194]">
              <span>UNIT 02</span>
              <span className="text-[#4edea3]">ACTIVE</span>
            </div>
            <h2 className="text-sm font-medium text-[#eef1f7] tracking-tight">
              Conversational Workbench
            </h2>
            <p className="font-mono text-[10px] text-[#8f9194] leading-relaxed">
              Iterative refinement without prompt re-typing. Switch aspect ratios with tactical segmented rockers on demand.
            </p>
          </div>

          {/* Unit 03 */}
          <div className="reveal-item reveal-delay-3 sda-reveal p-4 rounded-lg bg-[#111317] border border-[#232936] space-y-2 relative shadow-md">
            <div className="flex items-center justify-between font-mono text-[9px] text-[#8f9194]">
              <span>UNIT 03</span>
              <span className="text-[#4edea3]">READY</span>
            </div>
            <h2 className="text-sm font-medium text-[#eef1f7] tracking-tight">
              Precision Archive & Export
            </h2>
            <p className="font-mono text-[10px] text-[#8f9194] leading-relaxed">
              Full-resolution lossless downloads, prompt inspection, and upcoming 1-click Canva layered project export.
            </p>
          </div>
        </div>

        {/* Scroll CTA Strip */}
        <div className="reveal-item sda-reveal mt-16 w-full max-w-xl p-6 rounded-lg bg-[#111317] border border-[#232936] flex flex-col items-center gap-3 relative shadow-xl">
          <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-[#eef1f7] font-semibold">
            READY TO CALIBRATE YOUR STUDIO?
          </h3>
          <p className="font-mono text-[10px] text-[#8f9194] max-w-xs text-center">
            Zero configuration fees. Initialize in 60 seconds with your brand assets.
          </p>
          <Link
            href={isAuthenticated ? "/studio" : "/signup"}
            className="h-9 px-6 rounded-[2px] bg-[#eef1f7] hover:bg-white text-[#0c0e12] font-mono text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1.5 active:translate-y-[1px] transition-all"
          >
            ENTER STUDIO CANVAS
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#232936] bg-[#0c0e12] py-4 text-center font-mono text-[9px] text-[#8f9194]">
        EIDETIC VISUAL SYSTEMS // INDUSTRIAL MINIMALISM // ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
