"use client";

import React from "react";
import { AlertTriangle, ArrowUpRight, Zap } from "lucide-react";

interface LimitCardProps {
  currentUsage: number;
  monthlyLimit: number;
  planName?: string;
  onUpgrade?: () => void;
}

export function LimitCard({
  currentUsage,
  monthlyLimit,
  planName = "PRECISION FREE",
  onUpgrade,
}: LimitCardProps) {
  return (
    <div
      id="quota-limit-card"
      className="my-3 p-3.5 rounded-lg bg-[#111317] border border-[#ffb4ab]/40 text-[#ffb4ab] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg relative"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-[2px] bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-mono font-semibold text-xs text-[#eef1f7] uppercase flex items-center gap-2">
            CYCLE LIMIT EXHAUSTED ({currentUsage}/{monthlyLimit})
            <span className="text-[9px] px-1.5 py-0.2 rounded-[1px] bg-[#ffb4ab]/20 text-[#ffb4ab] font-mono">
              {planName}
            </span>
          </h4>
          <p className="font-mono text-[10px] text-[#8f9194] mt-1 max-w-lg leading-relaxed">
            Your brand specification has reached its allocated graphic generation limit for this billing cycle.
            Upgrade to Pro for unlimited brand profiles and 200 graphics/month.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          id="upgrade-plan-btn"
          type="button"
          onClick={onUpgrade}
          className="h-8 px-4 rounded-[2px] bg-[#eef1f7] hover:bg-white text-[#0c0e12] font-mono font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1.5 active:translate-y-[1px] transition-all"
        >
          <Zap className="w-3 h-3 fill-black" />
          UPGRADE TIER
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
