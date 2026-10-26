"use client";

import React, { useState } from "react";
import { Download, Copy, Check, Sliders, ExternalLink } from "lucide-react";
import { MessageMetadata } from "@/types/database";

interface GeneratedGraphicCardProps {
  imageUrl: string;
  metadata?: MessageMetadata | null;
  canvaConnected?: boolean;
  onConnectCanva?: () => void;
  brandName?: string;
  assetId?: string | null;
  tenantId?: string;
  onRefine?: () => void;
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
  onRefine,
}: GeneratedGraphicCardProps) {
  const displayUrl = normalizeGraphicUrl(imageUrl);
  const [copied, setCopied] = useState(false);

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
    a.download = `eidetic-${metadata?.format_preset || "graphic"}-${Date.now()}.${displayUrl.includes("svg") ? "svg" : "png"}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="mt-3 group flex flex-col gap-3 w-full max-w-xl"
      id="generated-graphic-card"
    >
      {/* Poster Preview Container */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-white shadow-[0_16px_40px_-8px_rgba(80,70,229,0.18)] border border-[#e0e2e8] flex flex-col justify-between transition-all duration-300 group-hover:shadow-[0_20px_48px_-6px_rgba(80,70,229,0.25)]">
        {/* Graphic Image Area */}
        <div className="relative w-full bg-[#f1f3f9] overflow-hidden flex items-center justify-center min-h-[340px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt="Brand graphic render"
            className="w-full h-auto object-cover max-h-[580px] transition-transform duration-500 group-hover:scale-[1.01]"
          />

          {/* Floating Pill Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none z-10">
            <span className="font-headline font-bold text-xs uppercase tracking-wider bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-[#181c20] shadow-md border border-[#e0e2e8]">
              {brandName}
            </span>
            <span className="font-mono text-xs bg-[#5046e5] text-white px-3 py-1 rounded-full shadow-md font-semibold">
              {metadata?.format_preset?.toUpperCase() || "4:5 POSTER"}
            </span>
          </div>

          <div className="absolute top-4 right-4 pointer-events-none z-10">
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[#181c20] font-mono text-xs shadow-md border border-[#e0e2e8]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>300 DPI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Tray */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="font-['Space_Grotesk'] font-bold text-xs text-[#181c20]">
            {metadata?.format_preset?.replace("_", " ").toUpperCase() || "GRAPHIC"}
          </span>
          <span className="text-[11px] text-[#777587] font-mono">
            {metadata?.aspect_ratio ? `(${metadata.aspect_ratio})` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRefine && (
            <button
              type="button"
              onClick={onRefine}
              className="h-9 px-4 rounded-full bg-[#5046e5] hover:bg-[#4338ca] text-white font-headline text-xs font-semibold transition-all shadow-[0_4px_14px_rgba(80,70,229,0.2)] flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Refine</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="h-9 px-4 rounded-full bg-white hover:bg-[#f1f3f9] text-[#181c20] font-headline text-xs font-semibold transition-all border border-[#e0e2e8] shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#5046e5]" />
            <span>Download</span>
          </button>

          {metadata?.prompt_sent && (
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="w-9 h-9 rounded-full bg-white hover:bg-[#f1f3f9] text-[#464555] hover:text-[#181c20] flex items-center justify-center border border-[#e0e2e8] transition-all shadow-sm"
              title="Copy generation prompt"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
