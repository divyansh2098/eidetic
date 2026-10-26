"use client";

import React, { useState, useRef } from "react";
import { BrandProfile, ToneOfVoice, LogoPosition } from "@/types/database";
import { generateUUID } from "@/lib/utils/uuid";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Palette,
  Sparkles,
  Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadBrandLogo } from "@/lib/utils/logo-upload";

interface BrandOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newBrand: BrandProfile) => Promise<void> | void;
  tenantId: string;
}

const COLOR_PALETTES = [
  { name: "Electric Indigo & Coral", primary: "#5046e5", secondaries: ["#fb603f", "#181829"] },
  { name: "Nordic Minimalist", primary: "#3625cd", secondaries: ["#414859", "#e2dfff"] },
  { name: "Modern Teal", primary: "#0d9488", secondaries: ["#115e59", "#99f6e4"] },
  { name: "Sunset Punch", primary: "#e11d48", secondaries: ["#881337", "#fecdd3"] },
];

const TONE_TAGS: ToneOfVoice[] = [
  "bold",
  "minimalist",
  "playful",
  "professional",
  "elegant",
  "friendly",
  "warm",
  "casual",
];

const INDUSTRIES = [
  "Creative & Design Agency",
  "Software & SaaS",
  "Clean Energy & Sustainability",
  "Specialty Coffee & F&B",
  "Fashion & Modern Retail",
  "Architecture & Spatial Design",
];

export function BrandOnboardingModal({
  isOpen,
  onClose,
  onComplete,
  tenantId,
}: BrandOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [brandId] = useState(() => generateUUID());

  // Form State
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [description, setDescription] = useState("");
  const [primaryColour, setPrimaryColour] = useState("#5046e5");
  const [secondaryColours, setSecondaryColours] = useState(["#fb603f", "#181829"]);
  const [typography, setTypography] = useState("Space Grotesk / Inter");
  const [selectedTones, setSelectedTones] = useState<ToneOfVoice[]>(["bold", "playful"]);
  const [targetAudience, setTargetAudience] = useState("");
  const [autoIncludeLogo, setAutoIncludeLogo] = useState(true);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>("top-left");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoStoragePath, setLogoStoragePath] = useState<string | null>(null);
  const [logoRasterStoragePath, setLogoRasterStoragePath] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const toggleTone = (tag: ToneOfVoice) => {
    if (selectedTones.includes(tag)) {
      setSelectedTones(selectedTones.filter((t) => t !== tag));
    } else {
      setSelectedTones([...selectedTones, tag]);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setLogoUploadError(null);

    try {
      const supabase = createClient();
      const result = await uploadBrandLogo(supabase, brandId, file, {
        logo_storage_path: logoStoragePath,
        logo_raster_storage_path: logoRasterStoragePath,
      });

      setLogoUrl(result.public_url);
      setLogoStoragePath(result.logo_storage_path);
      setLogoRasterStoragePath(result.logo_raster_storage_path);
    } catch (err: any) {
      console.error("[BrandOnboardingModal] Logo upload failed:", err);
      setLogoUploadError(err.message || "Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFinish = async () => {
    const finalName = brandName.trim() || "My Brand";
    const newBrand: BrandProfile = {
      id: brandId,
      tenant_id: tenantId,
      brand_name: finalName,
      logo_url: logoUrl,
      logo_storage_path: logoStoragePath,
      logo_raster_storage_path: logoRasterStoragePath,
      primary_colour: primaryColour,
      secondary_colours: secondaryColours,
      typography,
      brand_description: description.trim() || "Modern brand identity calibrated with dynamic aesthetics.",
      industry,
      tone_of_voice: selectedTones.length > 0 ? selectedTones : ["bold", "playful"],
      target_audience: targetAudience.trim() || "Modern consumers",
      guidelines_doc_url: null,
      sample_asset_urls: [],
      social_handles: {},
      auto_include_logo: autoIncludeLogo,
      logo_position: logoPosition,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setIsSaving(true);
    setSaveError("");
    try {
      await onComplete(newBrand);
      onClose();
    } catch (err: any) {
      console.error("Failed to save brand:", err);
      setSaveError(err.message || "Failed to save brand profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#181829]/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white text-[#181c20] w-full max-w-lg rounded-3xl shadow-[0_24px_60px_-12px_rgba(80,70,229,0.3)] border border-[#e0e2e8] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-[#e0e2e8] flex items-center justify-between bg-[#f7f9ff]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#5046e5] text-white flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-[#181c20]">
                Calibrate Brand DNA
              </h3>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#464555]">
                <span>STEP {step} OF 3</span>
                <span>·</span>
                <span>{step === 1 ? "ESSENCE" : step === 2 ? "PALETTE" : "ANCHOR & VOICE"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#e0e2e8] text-[#464555] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Viewport */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs uppercase text-[#464555] font-semibold block mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aesthete Architecture"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-[#f1f3f9] p-3 rounded-xl border border-[#e0e2e8] font-headline text-sm text-[#181c20] outline-none focus:border-[#5046e5]"
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase text-[#464555] font-semibold block mb-1">
                  Industry Focus
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-[#f1f3f9] p-3 rounded-xl border border-[#e0e2e8] text-sm text-[#181c20] outline-none"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-xs uppercase text-[#464555] font-semibold block mb-1">
                  Brand Description
                </label>
                <textarea
                  rows={3}
                  placeholder="A few words about your brand's unique design language and product..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#f1f3f9] p-3 rounded-xl border border-[#e0e2e8] text-sm text-[#181c20] outline-none focus:border-[#5046e5]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs uppercase text-[#464555] font-semibold block mb-2">
                  Select Visual Spectrum
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {COLOR_PALETTES.map((palette) => {
                    const isSelected = primaryColour === palette.primary;
                    return (
                      <button
                        key={palette.name}
                        type="button"
                        onClick={() => {
                          setPrimaryColour(palette.primary);
                          setSecondaryColours(palette.secondaries);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-[#e2dfff]/40 border-[#5046e5] shadow-sm"
                            : "bg-[#f1f3f9] border-[#e0e2e8] hover:bg-[#eceef4]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: palette.primary }} />
                          {palette.secondaries.map((sec, idx) => (
                            <div key={idx} className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: sec }} />
                          ))}
                        </div>
                        <span className="font-headline text-xs font-semibold text-[#181c20]">
                          {palette.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#f1f3f9] p-3.5 rounded-2xl border border-[#e0e2e8] flex items-center justify-between">
                <div>
                  <div className="font-headline text-xs font-semibold text-[#181c20]">Custom Primary Swatch</div>
                  <div className="font-mono text-[11px] text-[#464555]">{primaryColour}</div>
                </div>
                <input
                  type="color"
                  value={primaryColour}
                  onChange={(e) => setPrimaryColour(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-[#e0e2e8]"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {/* Logo Upload Section with reliable button */}
              <div>
                <label className="font-mono text-xs uppercase text-[#464555] font-semibold block mb-1.5">
                  Brand Logo Asset (Optional)
                </label>
                <div className="flex items-center gap-4 bg-[#f1f3f9] p-3.5 rounded-2xl border border-[#e0e2e8]">
                  <div className="w-14 h-14 rounded-xl bg-white border border-[#e0e2e8] flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <Upload className="w-5 h-5 text-[#464555]" />
                    )}
                    {isUploadingLogo && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      disabled={isUploadingLogo}
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#5046e5] hover:bg-[#4338ca] text-white font-headline text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{logoUrl ? "Replace Logo" : "Select Logo File"}</span>
                    </button>
                    <p className="font-mono text-[10px] text-[#464555]">
                      PNG, JPEG, WebP, SVG (max 5 MB).
                    </p>
                  </div>
                </div>

                {logoUploadError && (
                  <div className="p-2.5 mt-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    {logoUploadError}
                  </div>
                )}
              </div>

              {/* Tones */}
              <div>
                <label className="font-mono text-xs uppercase text-[#464555] font-semibold block mb-1.5">
                  Tone of Voice
                </label>
                <div className="flex flex-wrap gap-2">
                  {TONE_TAGS.map((tag) => {
                    const isSelected = selectedTones.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTone(tag)}
                        className={`px-3 py-1 rounded-full font-headline text-xs font-semibold border transition-all ${
                          isSelected
                            ? "bg-[#5046e5] text-white border-[#5046e5] shadow-sm"
                            : "bg-[#f1f3f9] text-[#181c20] border-[#e0e2e8] hover:bg-[#e0e2e8]"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="font-mono text-xs uppercase text-[#464555] font-semibold block mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  placeholder="e.g. Modern founders, creative directors"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-[#f1f3f9] p-3 rounded-xl border border-[#e0e2e8] text-sm text-[#181c20] outline-none"
                />
              </div>
            </div>
          )}

          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {saveError}
            </div>
          )}
        </div>

        {/* Modal Navigation Footer */}
        <div className="p-4 border-t border-[#e0e2e8] flex items-center justify-between bg-[#f7f9ff]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="px-4 py-2 rounded-full border border-[#e0e2e8] text-[#181c20] hover:bg-[#e0e2e8] font-headline text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="px-5 py-2 rounded-full bg-[#5046e5] hover:bg-[#4338ca] text-white font-headline text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSaving}
              className="px-6 py-2 rounded-full bg-[#5046e5] hover:bg-[#4338ca] text-white font-headline text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_4px_14px_rgba(80,70,229,0.3)] disabled:opacity-50"
            >
              {isSaving ? (
                <span>Locking DNA...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Brand DNA</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
