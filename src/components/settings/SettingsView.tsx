"use client";

import React from "react";
import { Cpu, Database, ShieldCheck } from "lucide-react";

interface SettingsViewProps {
  tenantId?: string;
}

export function SettingsView({ tenantId }: SettingsViewProps) {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#f7f9ff] text-[#181c20] p-6 lg:p-10 space-y-8" id="settings-view">
      {/* Header Context Block */}
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2dfff] text-[#3422cc] font-mono text-[11px] font-bold uppercase mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5046e5]" />
          Workspace Configuration
        </div>
        <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#181c20] tracking-tight">
          Settings & Environment
        </h1>
        <p className="text-sm text-[#464555] max-w-xl mt-1 leading-relaxed">
          Configuration parameters for your tenant environment and AI generation pipelines.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Workspace Identity */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e0e2e8] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e2dfff] flex items-center justify-center text-[#5046e5]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#181c20]">
                Tenant Information
              </h3>
              <p className="text-xs text-[#464555]">
                Isolated database scope and cryptographic asset policies.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f1f3f9] border border-[#e0e2e8] font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#464555]">Tenant ID</span>
              <span className="text-[#181c20] font-semibold">{tenantId || "Sandbox Tenant Active"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#464555]">Security Protocol</span>
              <span className="text-emerald-600 font-semibold">Row-Level Security (RLS) Active</span>
            </div>
          </div>
        </div>

        {/* AI Model Pipeline */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e0e2e8] shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ffdad3] flex items-center justify-center text-[#fb603f]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#181c20]">
                AI Generation Pipeline
              </h3>
              <p className="text-xs text-[#464555]">
                Active Google Gemini model routing for orchestration and rendering.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#f1f3f9] border border-[#e0e2e8] space-y-1">
              <span className="font-mono text-[10px] uppercase text-[#5046e5] font-bold">
                Orchestrator Model
              </span>
              <div className="font-['Space_Grotesk'] font-bold text-sm text-[#181c20]">
                gemini-2.5-flash
              </div>
              <p className="text-xs text-[#464555]">
                Synthesizes brand guidelines, logo positions, and conversational refinements.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f1f3f9] border border-[#e0e2e8] space-y-1">
              <span className="font-mono text-[10px] uppercase text-[#fb603f] font-bold">
                Image Rendering Model
              </span>
              <div className="font-['Space_Grotesk'] font-bold text-sm text-[#181c20]">
                imagen-3.0-generate-002
              </div>
              <p className="text-xs text-[#464555]">
                Generates high-resolution output graphics conditioned on your brand DNA.
              </p>
            </div>
          </div>
        </div>

        {/* Cloud Storage Buckets */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e0e2e8] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e2dfff] flex items-center justify-center text-[#5046e5]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#181c20]">
                Cloud Storage Buckets
              </h3>
              <p className="text-xs text-[#464555]">
                Dedicated storage partitions for brand identity and created media.
              </p>
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 rounded-2xl bg-[#f1f3f9] border border-[#e0e2e8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[#181c20] font-semibold">brand-assets</span>
              </div>
              <span className="text-[#464555]">Logos & Brand Graphics</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#f1f3f9] border border-[#e0e2e8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[#181c20] font-semibold">generated-graphics</span>
              </div>
              <span className="text-[#464555]">Finished Creations & Archive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
