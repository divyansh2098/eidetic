"use client";

import React from "react";
import { X, Check, ShieldCheck, Cpu } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  onSelectPlan: (plan: string) => void;
}

const TIERS = [
  {
    id: "free",
    name: "PRECISION STARTER",
    price: "$0",
    period: "FOREVER",
    description: "Sandbox verification and solopreneur prototype testing.",
    features: [
      "20 AI graphic generations / mo",
      "Standard format presets (1:1, 9:16)",
      "1 Brand DNA specification",
      "Standard latency queue",
      "Community support",
    ],
    highlight: false,
    cta: "CURRENT SPEC",
  },
  {
    id: "pro",
    name: "PRECISION PRO",
    price: "$29",
    period: "PER MONTH",
    description: "For active brand operators with high visual output demands.",
    features: [
      "200 AI graphic generations / mo",
      "All optical presets + custom aspect ratios",
      "Up to 5 Brand DNA profiles",
      "1-click push to Canva bridge",
      "Lossless RAW asset exports",
      "Priority FP16 generation pipeline",
    ],
    highlight: true,
    cta: "ACTIVATE PRO",
  },
  {
    id: "business",
    name: "ENTERPRISE CLUSTER",
    price: "$89",
    period: "PER MONTH",
    description: "For multi-brand studios managing expansive visual systems.",
    features: [
      "Unlimited graphic synthesis",
      "Unlimited Brand DNA profiles",
      "Multi-tenant team collaboration",
      "Brand guidelines PDF ingestion",
      "Dedicated account manager",
      "Direct API access & webhooks",
    ],
    highlight: false,
    cta: "CONTACT SALES",
  },
];

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlan = "pro",
  onSelectPlan,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#111317] border border-[#333842] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        {/* Top Specular Edge */}
        <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="p-4 border-b border-[#232936] flex items-center justify-between bg-[#111317]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[2px] bg-[#1e2024] border border-[#333842] flex items-center justify-center text-[#4edea3]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-[#eef1f7] font-semibold">
                SUBSCRIPTION TIERS & ENGINE CAPACITY
              </h2>
              <p className="font-mono text-[9px] text-[#8f9194]">
                Scale throughput quotas, Canva pipeline access, and multi-tenant profiles.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[1px] text-[#8f9194] hover:text-white hover:bg-[#1e2024] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((tier) => {
            const isCurrent = tier.id === currentPlan;
            return (
              <div
                key={tier.id}
                className={`rounded-lg p-4 border flex flex-col justify-between transition-all relative ${
                  tier.highlight
                    ? "bg-[#16181d] border-[#4edea3] shadow-lg"
                    : "bg-[#0c0e12] border-[#232936] hover:border-[#333842]"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-[1px] font-mono text-[8px] font-bold uppercase tracking-wider bg-[#4edea3] text-black">
                    CALIBRATED STANDARD
                  </span>
                )}

                <div>
                  <h3 className="font-mono text-xs font-semibold uppercase text-[#eef1f7] tracking-wider">
                    {tier.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1 font-mono">
                    <span className="text-2xl font-bold text-[#eef1f7]">{tier.price}</span>
                    <span className="text-[9px] text-[#8f9194]">/{tier.period}</span>
                  </div>
                  <p className="font-mono text-[10px] text-[#8f9194] mt-1.5 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#232936] space-y-2 font-mono text-[10px]">
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[#c5c6ca]">
                        <Check className="w-3 h-3 text-[#4edea3] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPlan(tier.id);
                      onClose();
                    }}
                    className={`w-full py-2 rounded-[1px] font-mono text-[10px] uppercase font-semibold tracking-wider transition-all active:translate-y-[1px] ${
                      tier.highlight
                        ? "bg-[#eef1f7] hover:bg-white text-[#0c0e12] shadow-md"
                        : isCurrent
                        ? "bg-[#1e2024] text-[#8f9194] border border-[#232936] cursor-default"
                        : "bg-[#1e2024] hover:bg-[#282a2e] text-[#eef1f7] border border-[#333842]"
                    }`}
                  >
                    {isCurrent ? "ACTIVE SPEC" : tier.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#232936] bg-[#0c0e12] px-4 flex items-center justify-between font-mono text-[9px] text-[#8f9194]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4edea3]" />
            <span>SECURE ENCRYPTED CHECKOUT // CANCEL ANYTIME</span>
          </div>
          <span className="text-[#8f9194]">STRICT BRAND DNA PRESERVATION INCLUDED</span>
        </div>
      </div>
    </div>
  );
}
