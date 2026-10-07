"use client";

import React, { useState } from "react";
import { Layers, Zap, Cpu } from "lucide-react";

interface SettingsViewProps {
  canvaConnected?: boolean;
  onToggleCanva?: (status: boolean) => void;
  usageCount: number;
  usageLimit: number;
  onOpenUpgrade?: () => void;
  tenantId?: string;
}

export function SettingsView({
  usageCount,
  usageLimit,
  onOpenUpgrade,
}: SettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"integrations" | "usage" | "models">("integrations");

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 space-y-6 optical-grid-fine" id="settings-view">
      {/* Header Rail */}
      <div className="w-full bg-[#111317] p-3 rounded-[2px] border border-[#232936] flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-[0.2em] text-[#eef1f7] font-semibold uppercase">
              SETTINGS // ENGINE TELEMETRY
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.8)]" />
          </div>
          <p className="font-mono text-[9px] text-[#8f9194] mt-0.5">
            Canva bridge, quota odometer, and AI model pipeline routing.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#0c0e12] p-0.5 rounded-[1px] border border-[#232936] font-mono text-[9px]">
          <button
            type="button"
            onClick={() => setActiveSubTab("integrations")}
            className={`px-2.5 py-1 rounded-[1px] uppercase transition-colors ${
              activeSubTab === "integrations"
                ? "bg-[#1e2024] text-[#eef1f7] border border-[#333842] font-semibold"
                : "text-[#8f9194] hover:text-[#c5c6ca]"
            }`}
          >
            CANVA BRIDGE
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("usage")}
            className={`px-2.5 py-1 rounded-[1px] uppercase transition-colors ${
              activeSubTab === "usage"
                ? "bg-[#1e2024] text-[#eef1f7] border border-[#333842] font-semibold"
                : "text-[#8f9194] hover:text-[#c5c6ca]"
            }`}
          >
            QUOTAS & CYCLES
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("models")}
            className={`px-2.5 py-1 rounded-[1px] uppercase transition-colors ${
              activeSubTab === "models"
                ? "bg-[#1e2024] text-[#eef1f7] border border-[#333842] font-semibold"
                : "text-[#8f9194] hover:text-[#c5c6ca]"
            }`}
          >
            MODEL ROUTING
          </button>
        </div>
      </div>

      {/* SubTab 1: Canva Integration */}
      {activeSubTab === "integrations" && (
        <div className="max-w-3xl space-y-4 animate-fadeIn">
          <div className="p-5 rounded-lg bg-[#111317] border border-[#232936] space-y-4 relative">
            <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[2px] bg-[#1e2024] border border-[#333842] flex items-center justify-center text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-[#eef1f7] font-semibold">
                    CANVA PARTNER BRIDGE
                  </h3>
                  <p className="font-mono text-[10px] text-[#8f9194]">
                    Export lossless graphic layers into Canva design workspaces.
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-[1px] font-mono text-[9px] uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PENDING API AUDIT
              </span>
            </div>

            <div className="p-3 rounded-[1px] bg-[#0c0e12] border border-[#232936] font-mono text-[10px] text-[#c5c6ca] space-y-1.5">
              <div className="font-semibold text-[#eef1f7]">PIPELINE ARCHITECTURE SPEC:</div>
              <ul className="list-disc list-inside space-y-1 text-[#8f9194]">
                <li>Graphic outputs sync automatically to your Canva Team asset folder via OAuth 2.0 PKCE.</li>
                <li>&quot;Edit in Canva&quot; opens exact aspect ratio canvas with brand color presets pre-populated.</li>
                <li>Lossless resolution preserved across all cloud transitions.</li>
              </ul>
            </div>

            <div className="pt-1">
              <button
                type="button"
                disabled
                className="h-8 px-4 rounded-[1px] bg-[#1e2024] text-[#8f9194] border border-[#232936] font-mono text-[9px] uppercase tracking-wider cursor-not-allowed"
              >
                PARTNER CERTIFICATION IN PROGRESS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Usage & Quotas */}
      {activeSubTab === "usage" && (
        <div className="max-w-3xl space-y-4 animate-fadeIn">
          <div className="p-5 rounded-lg bg-[#111317] border border-[#232936] space-y-4 relative">
            <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#eef1f7] font-semibold flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#4edea3]" />
              ENGINE CYCLE STATUS & QUOTAS
            </h3>

            <div className="p-3.5 rounded-[1px] bg-[#0c0e12] border border-[#232936] space-y-2">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-[#8f9194]">CYCLES EXPENDED</span>
                <span className="text-[#4edea3] font-bold">
                  {usageCount} / {usageLimit}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#1e2024] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4edea3] shadow-[0_0_4px_rgba(78,222,163,0.9)] transition-all"
                  style={{ width: `${(usageCount / usageLimit) * 100}%` }}
                />
              </div>
              <p className="font-mono text-[9px] text-[#8f9194]">
                Cycle resets automatically on the 1st of every month. Strict hard block enforced upon quota exhaustion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-[1px] bg-[#0c0e12] border border-[#232936] space-y-1">
                <span className="font-mono text-[9px] text-[#8f9194] uppercase">FREE TIER</span>
                <div className="font-mono text-sm font-semibold text-[#eef1f7]">20 CYCLES</div>
                <p className="font-mono text-[9px] text-[#8f9194]">1 Brand spec, core aspect ratios</p>
              </div>

              <div className="p-3 rounded-[1px] bg-[#1e2024] border border-[#4edea3] space-y-1 relative">
                <span className="font-mono text-[9px] text-[#4edea3] uppercase font-semibold">PRO TIER [ACTIVE]</span>
                <div className="font-mono text-sm font-semibold text-[#eef1f7]">200 CYCLES</div>
                <p className="font-mono text-[9px] text-[#c5c6ca]">Unlimited brand profiles, custom aspect ratios</p>
              </div>

              <div className="p-3 rounded-[1px] bg-[#0c0e12] border border-[#232936] space-y-1">
                <span className="font-mono text-[9px] text-[#8f9194] uppercase">ENTERPRISE</span>
                <div className="font-mono text-sm font-semibold text-[#eef1f7]">UNLIMITED</div>
                <p className="font-mono text-[9px] text-[#8f9194]">Dedicated cluster, custom fine-tuning</p>
              </div>
            </div>

            {onOpenUpgrade && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  className="h-8 px-4 rounded-[1px] bg-[#eef1f7] hover:bg-white text-[#0c0e12] font-mono font-semibold text-[10px] uppercase tracking-wider transition-all"
                >
                  MODIFY SUBSCRIPTION TIER
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SubTab 3: AI Providers & Cost */}
      {activeSubTab === "models" && (
        <div className="max-w-3xl space-y-4 animate-fadeIn">
          <div className="p-5 rounded-lg bg-[#111317] border border-[#232936] space-y-3 relative">
            <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#eef1f7] font-semibold flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#4edea3]" />
              ENGINE INFERENCE ARCHITECTURE (TAD §5)
            </h3>
            <p className="font-mono text-[10px] text-[#8f9194]">
              Multi-provider architectural abstraction allows seamless fallback between Google Gemini and OpenAI.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[10px] border border-[#232936] rounded-[1px]">
                <thead className="bg-[#0c0e12] text-[#8f9194]">
                  <tr>
                    <th className="p-2.5">SUBSYSTEM</th>
                    <th className="p-2.5">ACTIVE ROUTE</th>
                    <th className="p-2.5">MODEL ID</th>
                    <th className="p-2.5">UNIT COST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232936]">
                  <tr>
                    <td className="p-2.5 text-[#eef1f7]">Orchestrator</td>
                    <td className="p-2.5 text-[#4edea3]">Google Gemini</td>
                    <td className="p-2.5 text-[#c5c6ca]">gemini-2.5-flash</td>
                    <td className="p-2.5 text-[#8f9194]">$0.0001 (Dev)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-[#eef1f7]">Optical Engine</td>
                    <td className="p-2.5 text-[#4edea3]">Gemini / Imagen 3</td>
                    <td className="p-2.5 text-[#c5c6ca]">imagen-3.0-generate</td>
                    <td className="p-2.5 text-[#8f9194]">$0.03 (Prod)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
