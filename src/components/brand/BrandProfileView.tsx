"use client";

import React, { useState, useRef } from "react";
import { BrandProfile, ToneOfVoice, LogoPosition } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { uploadBrandLogo } from "@/lib/utils/logo-upload";
import {
  Upload,
  Check,
  Save,
  Edit2,
  RotateCcw,
  Pipette,
  ArrowUpLeft,
  ArrowUpRight,
  Crosshair,
  ArrowDownLeft,
  ArrowDownRight,
} from "lucide-react";

interface BrandProfileViewProps {
  brand: BrandProfile;
  onUpdateBrand: (updated: BrandProfile) => Promise<void> | void;
}

const LOGO_POSITIONS: { key: LogoPosition; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "top-left", label: "Top Left", icon: ArrowUpLeft },
  { key: "top-right", label: "Top Right", icon: ArrowUpRight },
  { key: "center-watermark", label: "Center Watermark", icon: Crosshair },
  { key: "bottom-left", label: "Bottom Left", icon: ArrowDownLeft },
  { key: "bottom-right", label: "Bottom Right", icon: ArrowDownRight },
];

const TONE_OPTIONS: { key: ToneOfVoice; label: string }[] = [
  { key: "bold", label: "Bold" },
  { key: "playful", label: "Playful" },
  { key: "minimalist", label: "Minimalist" },
  { key: "friendly", label: "Friendly" },
  { key: "warm", label: "Warm" },
  { key: "casual", label: "Casual" },
  { key: "professional", label: "Professional" },
  { key: "elegant", label: "Elegant" },
];

export function BrandProfileView({ brand, onUpdateBrand }: BrandProfileViewProps) {
  const [formData, setFormData] = useState<BrandProfile>({ ...brand });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setLogoUploadError(null);

    try {
      const supabase = createClient();
      const result = await uploadBrandLogo(supabase, formData.id, file, {
        logo_storage_path: formData.logo_storage_path,
        logo_raster_storage_path: formData.logo_raster_storage_path,
      });

      setFormData((prev) => ({
        ...prev,
        logo_url: result.public_url,
        logo_storage_path: result.logo_storage_path,
        logo_raster_storage_path: result.logo_raster_storage_path,
      }));
    } catch (err: any) {
      console.error("[BrandProfileView] Logo upload failed:", err);
      setLogoUploadError(err.message || "Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleToneToggle = (tone: ToneOfVoice) => {
    if (formData.tone_of_voice.includes(tone)) {
      setFormData({
        ...formData,
        tone_of_voice: formData.tone_of_voice.filter((t) => t !== tone),
      });
    } else {
      setFormData({
        ...formData,
        tone_of_voice: [...formData.tone_of_voice, tone],
      });
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await onUpdateBrand(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const currentAnchor = formData.logo_position || "top-left";

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#f7f9ff] text-[#181c20] p-6 lg:p-10 space-y-8" id="brand-dna-view">
      {/* Header Context Block */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2dfff] text-[#3422cc] font-mono text-[11px] font-bold uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5046e5]" />
            Active Brand Identity
          </div>
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#181c20] tracking-tight">
            Brand DNA & Profile
          </h1>
          <p className="text-sm text-[#464555] max-w-xl mt-1 leading-relaxed">
            Customize the colors, typography, tone, and logo anchors used across your generated graphics.
          </p>
        </div>

        <button
          type="button"
          id="save-brand-profile-top-btn"
          onClick={() => handleSave()}
          className="h-10 px-6 rounded-full bg-[#5046e5] hover:bg-[#4338ca] text-white font-['Space_Grotesk'] text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Brand Identity Card */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl p-6 lg:p-8 border border-[#e0e2e8] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5046e5] to-[#fb603f] p-0.5 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
              {formData.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <span className="font-['Space_Grotesk'] text-xl font-bold text-[#5046e5]">
                  {formData.brand_name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              {isEditingName ? (
                <input
                  type="text"
                  value={formData.brand_name}
                  onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  onBlur={() => setIsEditingName(false)}
                  autoFocus
                  className="font-['Space_Grotesk'] text-2xl font-bold text-[#181c20] bg-[#f1f3f9] px-2 py-0.5 rounded-lg border border-[#5046e5] outline-none"
                />
              ) : (
                <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#181c20] tracking-tight">
                  {formData.brand_name}
                </h2>
              )}
              <button
                type="button"
                onClick={() => setIsEditingName(!isEditingName)}
                className="w-7 h-7 rounded-full bg-[#f1f3f9] hover:bg-[#e0e2e8] text-[#464555] flex items-center justify-center transition-colors"
                title="Edit brand name"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#464555] mb-1">
                Brand Description
              </label>
              <textarea
                value={formData.brand_description}
                onChange={(e) => setFormData({ ...formData, brand_description: e.target.value })}
                rows={2}
                placeholder="Describe your brand, product, and style in a sentence or two..."
                className="w-full bg-[#f1f3f9] focus:bg-white text-sm text-[#181c20] p-3 rounded-2xl border border-transparent focus:border-[#5046e5]/40 outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Editor Layout */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Palette & Typography */}
        <div className="flex flex-col gap-8">
          {/* Color Palette */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e0e2e8] shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#181c20]">
                  Color Palette
                </h3>
                <p className="text-xs text-[#464555]">
                  Click swatches to choose your primary and secondary colors.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    primary_colour: "#5046e5",
                    secondary_colours: ["#fb603f", "#181829"],
                  })
                }
                className="w-8 h-8 rounded-full bg-[#f1f3f9] text-[#464555] hover:text-[#181c20] flex items-center justify-center transition-colors"
                title="Reset to default palette"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Primary */}
              <div className="rounded-2xl p-3 bg-[#f1f3f9] border border-[#e0e2e8] flex flex-col justify-between h-32">
                <label
                  className="relative w-full h-14 rounded-xl shadow-sm flex items-end justify-end p-1.5 cursor-pointer overflow-hidden"
                  style={{ backgroundColor: formData.primary_colour }}
                >
                  <input
                    type="color"
                    value={formData.primary_colour}
                    onChange={(e) => setFormData({ ...formData, primary_colour: e.target.value })}
                    className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                  />
                  <Pipette className="w-3.5 h-3.5 text-white drop-shadow" />
                </label>
                <div>
                  <div className="text-xs font-semibold text-[#181c20]">Primary</div>
                  <div className="font-mono text-[11px] text-[#464555]">{formData.primary_colour}</div>
                </div>
              </div>

              {/* Secondary 1 */}
              <div className="rounded-2xl p-3 bg-[#f1f3f9] border border-[#e0e2e8] flex flex-col justify-between h-32">
                <label
                  className="relative w-full h-14 rounded-xl shadow-sm flex items-end justify-end p-1.5 cursor-pointer overflow-hidden"
                  style={{ backgroundColor: formData.secondary_colours[0] || "#fb603f" }}
                >
                  <input
                    type="color"
                    value={formData.secondary_colours[0] || "#fb603f"}
                    onChange={(e) => {
                      const newColors = [...formData.secondary_colours];
                      newColors[0] = e.target.value;
                      setFormData({ ...formData, secondary_colours: newColors });
                    }}
                    className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                  />
                  <Pipette className="w-3.5 h-3.5 text-white drop-shadow" />
                </label>
                <div>
                  <div className="text-xs font-semibold text-[#181c20]">Secondary</div>
                  <div className="font-mono text-[11px] text-[#464555]">{formData.secondary_colours[0] || "#fb603f"}</div>
                </div>
              </div>

              {/* Secondary 2 */}
              <div className="rounded-2xl p-3 bg-[#f1f3f9] border border-[#e0e2e8] flex flex-col justify-between h-32">
                <label
                  className="relative w-full h-14 rounded-xl shadow-sm flex items-end justify-end p-1.5 cursor-pointer overflow-hidden"
                  style={{ backgroundColor: formData.secondary_colours[1] || "#181829" }}
                >
                  <input
                    type="color"
                    value={formData.secondary_colours[1] || "#181829"}
                    onChange={(e) => {
                      const newColors = [...formData.secondary_colours];
                      newColors[1] = e.target.value;
                      setFormData({ ...formData, secondary_colours: newColors });
                    }}
                    className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                  />
                  <Pipette className="w-3.5 h-3.5 text-white drop-shadow" />
                </label>
                <div>
                  <div className="text-xs font-semibold text-[#181c20]">Accent</div>
                  <div className="font-mono text-[11px] text-[#464555]">{formData.secondary_colours[1] || "#181829"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e0e2e8] shadow-sm space-y-4">
            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#181c20]">
              Brand Typography
            </h3>
            <div className="p-4 rounded-2xl bg-[#f1f3f9] border border-[#e0e2e8] space-y-2">
              <div className="text-xs font-semibold text-[#464555]">Primary Headline Typeface</div>
              <div className="font-['Space_Grotesk'] text-xl font-bold text-[#181c20]">
                Space Grotesk
              </div>
              <p className="text-xs text-[#777587]">
                Paired with Inter for clean, legible body text across all output graphics.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Logo Engine & Tone of Voice */}
        <div className="flex flex-col gap-8">
          {/* Logo Engine */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e0e2e8] shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#181c20]">
                  Logo & Placement
                </h3>
                <p className="text-xs text-[#464555]">
                  Upload your logo and choose where it anchors on generated graphics.
                </p>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingLogo}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 px-4 rounded-full bg-[#5046e5] hover:bg-[#4338ca] text-white font-['Space_Grotesk'] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingLogo ? "Uploading..." : formData.logo_url ? "Replace" : "Upload"}</span>
                </button>
              </div>
            </div>

            {logoUploadError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-200">
                {logoUploadError}
              </div>
            )}

            {/* Interactive Placement Visualizer Canvas */}
            <div className="relative aspect-[4/3] rounded-2xl bg-gradient-to-tr from-[#181829] to-[#5046e5] p-4 flex flex-col justify-between overflow-hidden shadow-inner">
              {/* Top Corners */}
              <div className="flex justify-between items-start z-10">
                {/* Top Left */}
                <div className={`transition-all duration-200 ${currentAnchor === "top-left" ? "opacity-100 scale-100" : "opacity-30 scale-90"}`}>
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-[#181c20]">
                    {formData.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formData.logo_url} alt="Logo" className="w-4 h-4 object-contain" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#5046e5]" />
                    )}
                    <span>{formData.brand_name.toUpperCase()}</span>
                  </div>
                </div>

                {/* Top Right */}
                <div className={`transition-all duration-200 ${currentAnchor === "top-right" ? "opacity-100 scale-100" : "opacity-30 scale-90"}`}>
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-[#181c20]">
                    {formData.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formData.logo_url} alt="Logo" className="w-4 h-4 object-contain" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#5046e5]" />
                    )}
                    <span>{formData.brand_name.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Center */}
              <div className="flex justify-center items-center z-10">
                <div className={`transition-all duration-200 ${currentAnchor === "center-watermark" ? "opacity-100 scale-100" : "opacity-30 scale-90"}`}>
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#181c20] shadow-md">
                    {formData.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formData.logo_url} alt="Logo" className="w-5 h-5 object-contain" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-[#5046e5]" />
                    )}
                    <span>{formData.brand_name.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Corners */}
              <div className="flex justify-between items-end z-10">
                {/* Bottom Left */}
                <div className={`transition-all duration-200 ${currentAnchor === "bottom-left" ? "opacity-100 scale-100" : "opacity-30 scale-90"}`}>
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-[#181c20]">
                    {formData.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formData.logo_url} alt="Logo" className="w-4 h-4 object-contain" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#5046e5]" />
                    )}
                    <span>{formData.brand_name.toUpperCase()}</span>
                  </div>
                </div>

                {/* Bottom Right */}
                <div className={`transition-all duration-200 ${currentAnchor === "bottom-right" ? "opacity-100 scale-100" : "opacity-30 scale-90"}`}>
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-[#181c20]">
                    {formData.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formData.logo_url} alt="Logo" className="w-4 h-4 object-contain" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#5046e5]" />
                    )}
                    <span>{formData.brand_name.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Position Anchor Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#464555] block">
                Select Placement Position
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {LOGO_POSITIONS.map((pos) => {
                  const isSelected = currentAnchor === pos.key;
                  const Icon = pos.icon;
                  return (
                    <button
                      key={pos.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, logo_position: pos.key })}
                      className={`h-9 px-2 rounded-full font-['Space_Grotesk'] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${isSelected
                          ? "bg-[#5046e5] text-white shadow-sm"
                          : "bg-[#f1f3f9] text-[#464555] hover:bg-[#e0e2e8] hover:text-[#181c20]"
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{pos.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={formData.auto_include_logo}
                onChange={(e) => setFormData({ ...formData, auto_include_logo: e.target.checked })}
                className="w-4 h-4 accent-[#5046e5] rounded cursor-pointer"
              />
              <span className="text-xs text-[#181c20] font-medium">
                Always include logo on generated graphics
              </span>
            </label>
          </div>

          {/* Tone of Voice */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#e0e2e8] shadow-sm space-y-4">
            <div>
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#181c20]">
                Tone of Voice
              </h3>
              <p className="text-xs text-[#464555]">
                Select traits that describe your brand personality.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((tone) => {
                const isSelected = formData.tone_of_voice.includes(tone.key);
                return (
                  <button
                    key={tone.key}
                    type="button"
                    onClick={() => handleToneToggle(tone.key)}
                    className={`inline-flex items-center gap-1.5 h-8 px-4 rounded-full font-['Space_Grotesk'] text-xs font-semibold transition-all cursor-pointer ${isSelected
                        ? "bg-[#5046e5] text-white shadow-sm"
                        : "bg-[#f1f3f9] text-[#181c20] hover:bg-[#e0e2e8]"
                      }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{tone.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
