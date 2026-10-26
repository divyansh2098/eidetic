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
  FolderOpen,
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
    { key: "all", label: "All Formats" },
    { key: "portrait", label: "4:5 Portrait" },
    { key: "instagram_post", label: "1:1 Square" },
    { key: "instagram_story", label: "9:16 Story" },
    { key: "wide_banner", label: "16:9 Banner" },
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
    } catch {}
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm("Delete this asset from your archive?")) {
      onDeleteAsset(id);
      if (previewAsset?.id === id) {
        setPreviewAsset(null);
      }
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#f7f9ff] text-[#181c20] p-6 lg:p-10 space-y-8" id="asset-gallery-view">
      {/* Header Context Block matching Stitch */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 max-w-6xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#e2dfff] text-[#3422cc] font-mono text-[11px] font-bold uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5046e5] animate-pulse" />
            Asset Archive & Gallery
          </div>
          <h1 className="font-headline text-3xl lg:text-4xl font-bold text-[#181c20] tracking-tight">
            Generated Asset Library
          </h1>
          <p className="text-sm text-[#464555] max-w-2xl mt-1 leading-relaxed">
            Search, inspect, and export your brand-compliant visual drops across multi-channel presets.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#464555] bg-white px-4 py-2 rounded-full border border-[#e0e2e8] shadow-sm">
          <span>Total Drops:</span>
          <strong className="text-[#5046e5] font-bold">{assets.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="max-w-6xl mx-auto bg-white p-4 rounded-2xl border border-[#e0e2e8] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Preset Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {presets.map((p) => {
            const isSelected = filterPreset === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setFilterPreset(p.key)}
                className={`h-9 px-4 rounded-full font-headline text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#5046e5] text-white shadow-sm"
                    : "bg-[#f1f3f9] text-[#464555] hover:text-[#181c20] hover:bg-[#e0e2e8]"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Search Input Well */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777587]" />
          <input
            type="text"
            placeholder="Search formats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f1f3f9] border border-[#e0e2e8] rounded-full text-xs text-[#181c20] placeholder-[#777587] outline-none focus:border-[#5046e5] transition-colors"
          />
        </div>
      </div>

      {/* Assets Grid */}
      <div className="max-w-6xl mx-auto">
        {filteredAssets.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#e0e2e8] shadow-sm max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e2dfff] flex items-center justify-center mx-auto text-[#5046e5]">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h3 className="font-headline font-bold text-lg text-[#181c20]">
              No assets found
            </h3>
            <p className="text-sm text-[#464555] leading-relaxed">
              Generate new graphics in the Studio Canvas to archive high-resolution assets here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setPreviewAsset(asset)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-[#e0e2e8] shadow-[0_4px_20px_-2px_rgba(80,70,229,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(80,70,229,0.15)] transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Image Area */}
                <div className="relative w-full aspect-[4/5] bg-[#f1f3f9] overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.public_url}
                    alt={asset.format_preset}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute top-3 left-3">
                    <span className="font-mono text-[10px] uppercase font-bold bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[#181c20] shadow-sm border border-[#e0e2e8]">
                      {asset.format_preset.replace("_", " ")}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(asset.id, e)}
                      className="w-8 h-8 rounded-full bg-white/90 text-red-600 hover:bg-white flex items-center justify-center shadow-md transition-all"
                      title="Delete asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Meta Tray */}
                <div className="p-4 flex items-center justify-between bg-white border-t border-[#e0e2e8]">
                  <div className="space-y-0.5">
                    <div className="font-headline font-semibold text-xs text-[#181c20]">
                      {asset.aspect_ratio || "4:5"} Canvas
                    </div>
                    <div className="font-mono text-[10px] text-[#777587]">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleCopyUrl(asset, e)}
                      className="w-8 h-8 rounded-full hover:bg-[#f1f3f9] text-[#464555] flex items-center justify-center transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDownload(asset, e)}
                      className="w-8 h-8 rounded-full bg-[#5046e5] text-white hover:bg-[#4338ca] flex items-center justify-center shadow-sm transition-all"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {previewAsset && (
        <div
          onClick={() => setPreviewAsset(null)}
          className="fixed inset-0 z-50 bg-[#181829]/70 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#e0e2e8] max-w-2xl w-full flex flex-col"
          >
            <div className="p-4 border-b border-[#e0e2e8] flex items-center justify-between bg-[#f7f9ff]">
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-sm text-[#181c20]">
                  {previewAsset.format_preset.replace("_", " ").toUpperCase()}
                </span>
                <span className="font-mono text-xs text-[#777587]">
                  ({previewAsset.aspect_ratio})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="w-8 h-8 rounded-full hover:bg-[#e0e2e8] text-[#464555] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#f1f3f9] p-6 flex items-center justify-center max-h-[65vh] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewAsset.public_url}
                alt="Preview"
                className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-lg"
              />
            </div>

            <div className="p-4 bg-white flex items-center justify-between border-t border-[#e0e2e8]">
              <span className="font-mono text-xs text-[#464555]">
                Lossless PNG Export · 300 DPI
              </span>
              <button
                type="button"
                onClick={() => handleDownload(previewAsset)}
                className="px-5 py-2 rounded-full bg-[#5046e5] hover:bg-[#4338ca] text-white font-headline text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
