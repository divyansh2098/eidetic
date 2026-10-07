"use client";

import React, { useState } from "react";
import { Asset } from "@/types/database";
import { 
  Download, 
  Trash2, 
  Search, 
  Copy, 
  Check, 
  X, 
  Maximize2, 
  Image as ImageIcon,
  Crop,
  Layers,
} from "lucide-react";

interface AssetGalleryProps {
  assets: Asset[];
  canvaConnected?: boolean;
  onConnectCanva?: () => void;
  onDeleteAsset: (id: string) => void;
  brandName?: string;
}

export function AssetGallery({
  assets,
  onDeleteAsset,
  brandName = "ACTIVE BRAND",
}: AssetGalleryProps) {
  const [filterPreset, setFilterPreset] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const presets = [
    { key: "all", label: "ALL BUFFERS" },
    { key: "instagram_post", label: "1:1 SQ" },
    { key: "instagram_story", label: "9:16 VERT" },
    { key: "wide_banner", label: "16:9 BANNER" },
    { key: "portrait", label: "4:5 PORT" },
  ];

  const filteredAssets = assets.filter((asset) => {
    const matchesPreset = filterPreset === "all" || asset.format_preset === filterPreset;
    const matchesSearch =
      asset.format_preset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.aspect_ratio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPreset && matchesSearch;
  });

  const handleDownload = (asset: Asset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const a = document.createElement("a");
    a.href = asset.public_url;
    a.download = `eidetic-${asset.format_preset}-${asset.id.slice(0, 8)}.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyUrl = async (asset: Asset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(asset.public_url);
      setCopiedId(asset.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm("Purge this synthesized asset from the archive?")) {
      onDeleteAsset(id);
      if (previewAsset?.id === id) {
        setPreviewAsset(null);
      }
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 space-y-6 optical-grid-fine" id="asset-gallery-view">
      {/* Top Header Rail */}
      <div className="w-full bg-[#111317] p-3 rounded-[2px] border border-[#232936] flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-[0.2em] text-[#eef1f7] font-semibold uppercase">
              ARCHIVE // VISUAL ASSETS
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.8)]" />
          </div>
          <div className="h-3 w-px bg-[#232936] hidden sm:block" />
          <div className="bg-[#0c0e12] px-2 py-0.5 rounded-[1px] border border-[#232936] font-mono text-[9px] text-[#8f9194]">
            COUNT: <span className="text-[#eef1f7]">{String(assets.length).padStart(2, "0")}</span> / 4096
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Well */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8f9194]" />
            <input
              type="text"
              placeholder="SEARCH ASSETS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-2.5 py-1 bg-[#0c0e12] border border-[#232936] rounded-[1px] font-mono text-[10px] text-[#eef1f7] placeholder-[#8f9194] focus:outline-none focus:border-[#333842] w-44 transition-colors uppercase"
            />
          </div>

          {/* Segmented Rocker Filter */}
          <div className="flex items-center bg-[#0c0e12] p-0.5 rounded-[1px] border border-[#232936]">
            {presets.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setFilterPreset(p.key)}
                className={`px-2 py-0.5 rounded-[1px] font-mono text-[9px] transition-all uppercase ${
                  filterPreset === p.key
                    ? "bg-[#1e2024] text-[#eef1f7] border border-[#333842] font-semibold shadow-sm"
                    : "text-[#8f9194] hover:text-[#c5c6ca]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exhibition Grid */}
      {filteredAssets.length === 0 ? (
        <div className="py-24 text-center space-y-2">
          <div className="w-12 h-12 rounded-[2px] bg-[#111317] border border-[#232936] flex items-center justify-center mx-auto text-[#8f9194]">
            <ImageIcon className="w-5 h-5" />
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-[#eef1f7] font-semibold">
            {searchQuery || filterPreset !== "all" ? "NO MATCHING ASSETS LOCATED" : "ARCHIVE UNPOPULATED"}
          </p>
          <p className="font-mono text-[10px] text-[#8f9194] max-w-sm mx-auto">
            Render brand graphics in the Studio Canvas to archive high-resolution assets here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setPreviewAsset(asset)}
              className="group relative bg-[#111317] rounded-lg p-2 border border-[#232936] hover:border-[#333842] shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Top Specular Edge */}
              <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

              {/* Recessed Image Viewport */}
              <div className="relative w-full aspect-square bg-[#0c0e12] overflow-hidden rounded-[2px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-black/50 flex items-center justify-center">
                {/* Corner registration mark */}
                <div className="absolute top-2 left-2 z-20 pointer-events-none font-mono text-[9px] text-[#eef1f7] opacity-60">
                  +
                </div>
                <div className="absolute top-2 right-2 z-20 pointer-events-none font-mono text-[9px] text-[#eef1f7] opacity-60">
                  +
                </div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.public_url}
                  alt="Asset render"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />

                {/* Floating Format Pill */}
                <div className="absolute top-2 left-5 z-20 pointer-events-none font-mono text-[8px] px-1.5 py-0.5 rounded-[1px] bg-[#0c0e12]/80 backdrop-blur-md border border-[#232936] text-[#eef1f7]">
                  {asset.aspect_ratio}
                </div>

                {/* Hover Trigger Bar */}
                <div className="absolute inset-0 bg-[#0c0e12]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-30">
                  <button
                    type="button"
                    onClick={(e) => handleDownload(asset, e)}
                    className="p-1.5 rounded-[1px] bg-[#1e2024] hover:bg-[#282a2e] text-[#eef1f7] border border-[#333842] transition-colors"
                    title="Download Raw"
                  >
                    <Download className="w-3.5 h-3.5 text-[#4edea3]" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleCopyUrl(asset, e)}
                    className="p-1.5 rounded-[1px] bg-[#1e2024] hover:bg-[#282a2e] text-[#eef1f7] border border-[#333842] transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? (
                      <Check className="w-3.5 h-3.5 text-[#4edea3]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(asset.id, e)}
                    className="p-1.5 rounded-[1px] bg-[#1e2024] hover:bg-[#282a2e] text-[#8f9194] hover:text-[#ffb4ab] border border-[#333842] transition-colors"
                    title="Purge Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Milled Card Base Telemetry */}
              <div className="mt-2 px-1 flex items-center justify-between font-mono text-[8px] text-[#8f9194]">
                <span className="truncate">ID: {asset.id.slice(0, 8)}</span>
                <span className="text-[#c5c6ca]">{asset.format.toUpperCase()} RAW</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Inspector Modal */}
      {previewAsset && (
        <div
          id="asset-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="w-full max-w-4xl bg-[#111317] border border-[#333842] rounded-lg p-3 space-y-3 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#232936]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.8)]" />
                <span className="font-mono text-xs uppercase text-[#eef1f7] font-semibold">
                  ASSET LIGHTBOX INSPECTOR
                </span>
                <span className="font-mono text-[9px] text-[#8f9194]">[{previewAsset.id}]</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="p-1 text-[#8f9194] hover:text-white rounded-[1px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewport */}
            <div className="relative w-full max-h-[70vh] bg-[#0c0e12] rounded-[2px] overflow-hidden border border-black flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewAsset.public_url}
                alt="Enlarged asset"
                className="max-h-[68vh] w-auto object-contain filter contrast-[1.02]"
              />
            </div>

            {/* Actions & Telemetry Footer */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3 font-mono text-[9px] text-[#8f9194]">
                <span>FORMAT: <span className="text-[#eef1f7]">{previewAsset.aspect_ratio}</span></span>
                <span>•</span>
                <span>RESOLUTION: <span className="text-[#eef1f7]">{previewAsset.width} × {previewAsset.height}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(previewAsset)}
                  className="h-7 px-3 rounded-[1px] bg-[#eef1f7] hover:bg-white text-[#0c0e12] font-mono text-[9px] uppercase font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" />
                  DOWNLOAD RAW
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
