"use client";

import React, { useState } from "react";
import { Download, Copy, Check, Eye } from "lucide-react";
import { MessageMetadata } from "@/types/database";

interface GeneratedGraphicCardProps {
  imageUrl: string;
  metadata?: MessageMetadata | null;
  canvaConnected?: boolean;
  onConnectCanva?: () => void;
  brandName?: string;
  assetId?: string | null;
  tenantId?: string;
}

function normalizeGraphicUrl(url?: string | null): string {
  if (!url) return "";
  if (
    url.startsWith("data:image/png;base64,") &&
    (url.includes("PHN2Zy") || url.includes("Cjxzdmc"))
  ) {
    return url.replace("data:image/png;base64,", "data:image/svg+xml;base64,");
  }
  return url;
}

export function GeneratedGraphicCard({
  imageUrl,
  metadata,
  brandName = "ACTIVE BRAND",
}: GeneratedGraphicCardProps) {
  const displayUrl = normalizeGraphicUrl(imageUrl);
  const [copied, setCopied] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  const handleCopyPrompt = () => {
    if (metadata?.prompt_sent) {
      navigator.clipboard.writeText(metadata.prompt_sent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = displayUrl;
    a.download = `eidetic-${metadata?.format_preset || "spec"}-${Date.now()}.${displayUrl.includes("svg") ? "svg" : "png"}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="mt-2 group relative bg-[#111317] rounded-lg p-2.5 border border-[#232936] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85),0_2px_4px_rgba(0,0,0,0.5)] transition-all max-w-2xl"
      id="generated-graphic-card"
    >
      {/* Top Specular Edge */}
      <div className="absolute top-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Titanium Corner Registration Crop Marks (+) */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none text-[#eef1f7] font-mono text-[11px] opacity-75 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
        +
      </div>
      <div className="absolute top-4 right-4 z-30 pointer-events-none text-[#eef1f7] font-mono text-[11px] opacity-75 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
        +
      </div>
      <div className="absolute bottom-11 left-4 z-30 pointer-events-none text-[#eef1f7] font-mono text-[11px] opacity-75 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
        +
      </div>
      <div className="absolute bottom-11 right-4 z-30 pointer-events-none text-[#eef1f7] font-mono text-[11px] opacity-75 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
        +
      </div>

      {/* Visual Viewport Well */}
      <div className="relative w-full bg-[#0c0e12] overflow-hidden rounded-[2px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-black/40 min-h-[300px] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayUrl}
          alt="Brand graphic render"
          className="w-full h-auto object-cover max-h-[540px] filter contrast-[1.03] transition-transform duration-500 group-hover:scale-[1.01]"
        />

        {/* Floating Spec Tag */}
        <div className="absolute top-3 left-7 flex items-center gap-2 pointer-events-none">
          <div className="px-2 py-0.5 rounded-[1px] bg-[#0c0e12]/90 backdrop-blur-md border border-[#232936] text-[10px] font-mono text-[#eef1f7] flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_4px_rgba(78,222,163,0.9)]" />
            <span>{metadata?.format_preset?.toUpperCase() || "FORMAT 1:1"}</span>
            <span className="text-[#8f9194]">({metadata?.aspect_ratio || "1:1"})</span>
          </div>
          <span className="px-2 py-0.5 rounded-[1px] bg-[#111317]/80 backdrop-blur-md border border-[#232936] text-[9px] font-mono text-[#c5c6ca]">
            {brandName.toUpperCase()}
          </span>
        </div>

        {/* Hover Instrument Keys (Tactile Floating Actions) */}
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 z-40 px-4">
          {/* Download Raw Action */}
          <button
            id="download-graphic-btn"
            type="button"
            onClick={handleDownload}
            className="h-8 px-3.5 bg-[#1e2024]/95 hover:bg-[#282a2e] text-[#eef1f7] border border-[#333842] rounded-[2px] font-mono text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.7)] active:translate-y-[1px] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#4edea3]" />
            <span className="font-semibold">DOWNLOAD RAW</span>
          </button>

          {metadata?.prompt_sent && (
            <>
              <button
                type="button"
                onClick={() => setShowPromptModal(!showPromptModal)}
                className="h-8 px-3 bg-[#1e2024]/95 hover:bg-[#282a2e] text-[#c5c6ca] hover:text-[#eef1f7] border border-[#333842] rounded-[2px] font-mono text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.7)] active:translate-y-[1px] transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>SPEC PROMPT</span>
              </button>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="h-8 px-3 bg-[#1e2024]/95 hover:bg-[#282a2e] text-[#c5c6ca] hover:text-[#eef1f7] border border-[#333842] rounded-[2px] font-mono text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.7)] active:translate-y-[1px] transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#4edea3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "COPIED" : "COPY"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Milled Base Telemetry Carrier Strip */}
      <div className="mt-2.5 px-2.5 py-1.5 flex items-center justify-between bg-[#0c0e12]/80 border border-[#232936] rounded-[2px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-3 font-mono text-[10px] text-[#8f9194] tracking-wider">
          <span>APERTURE: <span className="text-[#eef1f7]">RAW_01</span></span>
          <span className="text-[#333842]">•</span>
          <span>FORMAT: <span className="text-[#eef1f7]">{metadata?.aspect_ratio || "1:1"}</span></span>
          <span className="text-[#333842]">•</span>
          <span>STATUS: <span className="text-[#4edea3]">SYNTHESIZED</span></span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#111317] px-2 py-0.5 rounded-[1px] border border-[#232936]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_4px_rgba(78,222,163,0.8)]" />
          <span className="font-mono text-[10px] text-[#4edea3] font-semibold tracking-wider">
            BRAND DNA: 100%
          </span>
        </div>
      </div>

      {/* Expanded Prompt Snapshot */}
      {showPromptModal && metadata?.prompt_sent && (
        <div className="mt-2 p-3 bg-[#0c0e12] border border-[#232936] rounded-[2px] font-mono text-[10px] text-[#c5c6ca] space-y-1.5 animate-fadeIn">
          <div className="font-semibold text-[#8f9194] uppercase tracking-wider">
            SYNTHESIZED PROMPT MATRIX
          </div>
          <p className="bg-[#111317] p-2.5 rounded-[1px] border border-[#232936] leading-relaxed whitespace-pre-wrap text-[#eef1f7]">
            {metadata.prompt_sent}
          </p>
        </div>
      )}
    </div>
  );
}
