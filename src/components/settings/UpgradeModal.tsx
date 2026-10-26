"use client";

import React from "react";
import { X, Check, Sparkles } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  onSelectPlan: (plan: string) => void;
}

const TIERS = [
  {
    id: "free",
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Sandbox verification and prototype testing.",
    features: [
      "20 AI graphic generations / mo",
      "Standard format presets (1:1, 9:16)",
      "1 Brand DNA specification",
      "Standard latency queue",
      "Community support",
    ],
    highlight: false,
    cta: "Current Plan",
  },
  {
    id: "pro",
    name: "Precision Pro",
    price: "$29",
    period: "per month",
    description: "For active brand operators with high visual output demands.",
    features: [
      "200 AI graphic generations / mo",
      "All optical presets + custom aspect ratios",
      "Up to 5 Brand DNA profiles",
      "1-click push to Canva bridge",
      "Lossless 300 DPI asset exports",
      "Priority generation queue",
    ],
    highlight: true,
    cta: "Activate Pro",
  },
  {
    id: "business",
    name: "Studio Enterprise",
    price: "$89",
    period: "per month",
    description: "For multi-brand studios managing expansive visual systems.",
    features: [
      "Unlimited graphic generation",
      "Unlimited Brand DNA profiles",
      "Multi-tenant team collaboration",
      "Brand guidelines PDF ingestion",
      "Dedicated account manager",
      "Direct API access & webhooks",
    ],
    highlight: false,
    cta: "Contact Sales",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181829]/70 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-white text-[#181c20] rounded-3xl shadow-2xl border border-[#e0e2e8] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#e0e2e8] flex items-center justify-between bg-[#f7f9ff]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#5046e5] text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-[#181c20]">
                Subscription Tiers & Engine Capacity
              </h2>
              <p className="text-xs text-[#464555]">
                Scale throughput quotas, Canva pipeline access, and multi-tenant profiles.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#e0e2e8] text-[#464555] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 lg:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#f7f9ff]">
          {TIERS.map((tier) => {
            const isCurrent = currentPlan === tier.id;
            return (
              <div
                key={tier.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all ${
                  tier.highlight
                    ? "bg-white border-2 border-[#5046e5] shadow-[0_16px_36px_-6px_rgba(80,70,229,0.2)]"
                    : "bg-white border border-[#e0e2e8] shadow-sm"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5046e5] text-white text-[10px] font-mono uppercase font-bold px-3 py-1 rounded-full shadow-sm">
                    Recommended Tier
                  </div>
                )}

                <div>
                  <h3 className="font-headline font-bold text-lg text-[#181c20] mb-1">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-[#464555] min-h-[36px] leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="my-5 flex items-baseline gap-1">
                    <span className="font-headline text-3xl font-bold text-[#181c20]">
                      {tier.price}
                    </span>
                    <span className="text-xs text-[#464555]">/{tier.period}</span>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-[#e0e2e8]">
                    {tier.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#464555]">
                        <Check className="w-4 h-4 text-[#5046e5] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#e0e2e8]">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPlan(tier.id);
                      onClose();
                    }}
                    disabled={isCurrent}
                    className={`w-full h-11 rounded-full font-headline text-xs font-semibold transition-all cursor-pointer ${
                      tier.highlight
                        ? "bg-[#5046e5] hover:bg-[#4338ca] text-white shadow-sm"
                        : isCurrent
                        ? "bg-[#f1f3f9] text-[#777587] cursor-default border border-[#e0e2e8]"
                        : "bg-[#f1f3f9] hover:bg-[#e0e2e8] text-[#181c20] border border-[#e0e2e8]"
                    }`}
                  >
                    {isCurrent ? "Current Plan" : tier.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
