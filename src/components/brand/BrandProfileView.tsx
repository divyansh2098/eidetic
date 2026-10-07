"use client";

import React, { useState } from "react";
import { BrandProfile, ToneOfVoice, LogoPosition } from "@/types/database";
import { Save, Check, Upload, ShieldCheck, FileText, Lock, Terminal, Cpu } from "lucide-react";

interface BrandProfileViewProps {
  brand: BrandProfile;
  onUpdateBrand: (updated: BrandProfile) => void;
}

const ALL_TONES: ToneOfVoice[] = [
  "minimalist",
  "bold",
  "professional",
  "playful",
  "warm",
  "casual",
  "elegant",
  "friendly",
];

const LOGO_POSITIONS: { key: LogoPosition; label: string; quadrant: string }[] = [
  { key: "top-left", label: "NW QUADRANT", quadrant: "TL" },
  { key: "top-right", label: "NE QUADRANT", quadrant: "TR" },
  { key: "bottom-left", label: "SW QUADRANT", quadrant: "BL" },
  { key: "bottom-right", label: "SE QUADRANT", quadrant: "BR" },
  { key: "center-watermark", label: "CENTER EMBOSS", quadrant: "CTR" },
];

export function BrandProfileView({ brand, onUpdateBrand }: BrandProfileViewProps) {
  const [formData, setFormData] = useState<BrandProfile>({ ...brand });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [guidelinesFileName, setGuidelinesFileName] = useState<string | null>(
    brand.guidelines_doc_url ? "brand_guidelines.pdf" : null
  );
  const [guidelinesParsed, setGuidelinesParsed] = useState<boolean>(
    Boolean(brand.guidelines_doc_url)
  );

  const handleGuidelinesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGuidelinesFileName(file.name);
    setIsParsing(true);

    setTimeout(() => {
      setIsParsing(false);
      setGuidelinesParsed(true);
      setFormData((prev) => ({
        ...prev,
        guidelines_doc_url: `https://storage.eidetic.app/guidelines/${file.name}`,
      }));
    }, 900);
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBrand(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 space-y-6 optical-grid-fine" id="brand-profile-view">
      {/* Sub-header Calibration Rail */}
      <div className="w-full bg-[#111317] p-3 rounded-[2px] border border-[#232936] flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase text-[#8f9194]">
            <span>SYS.ENG</span>
            <span className="text-[#333842]">/</span>
            <span className="text-[#c5c6ca]">CALIBRATION</span>
            <span className="text-[#333842]">/</span>
            <span className="text-[#eef1f7] font-semibold">BRAND DNA MATRIX</span>
          </div>
          <div className="h-3 w-px bg-[#232936] hidden sm:block" />
          <div className="flex items-center gap-1.5 bg-[#0c0e12] px-2 py-0.5 rounded-[1px] border border-[#232936]">
            <span className="font-mono text-[9px] text-[#8f9194]">PROFILE:</span>
            <span className="font-mono text-[9px] text-[#eef1f7] font-medium">{formData.brand_name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0c0e12] rounded-[1px] border border-[#232936]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.9)]" />
            <span className="font-mono text-[9px] text-[#4edea3] uppercase font-semibold">DNA LOCKED</span>
            <span className="font-mono text-[8px] text-[#8f9194]">// REV: 8941</span>
          </div>

          <button
            id="save-brand-btn"
            type="button"
            onClick={handleSave}
            className="h-8 px-4 rounded-[2px] bg-[#eef1f7] hover:bg-white text-[#0c0e12] font-mono text-[10px] tracking-wider uppercase font-semibold flex items-center gap-1.5 border border-white/20 shadow-sm active:translate-y-[1px] transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0c0e12]" />
                LOCKED TO ENGINE
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                SAVE DNA
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Calibrated Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* LEFT COLUMN: Identity & Spectral Color Matrix */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Unit 01 // Identity Parameters (Recessed wells) */}
          <div className="bg-[#111317] p-4 rounded-lg border border-[#232936] shadow-sm flex flex-col gap-3 relative">
            <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between pb-1 border-b border-[#232936]/60">
              <span className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider">
                UNIT 01 // IDENTITY PARAMETERS
              </span>
              <span className="font-mono text-[9px] text-[#4edea3] uppercase font-semibold">REG.0x11</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Brand Designation Well */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider">
                  Entity Name
                </label>
                <div className="bg-[#0c0e12] p-2 rounded-[1px] border border-[#232936] flex items-center justify-between shadow-inner">
                  <input
                    id="input-brand-name"
                    type="text"
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    className="bg-transparent font-mono text-xs text-[#eef1f7] outline-none w-full"
                  />
                  <Lock className="w-3 h-3 text-[#8f9194] ml-1 shrink-0" />
                </div>
              </div>

              {/* Space Descriptor */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider">
                  Sub-Tier / Industry
                </label>
                <div className="bg-[#0c0e12] p-2 rounded-[1px] border border-[#232936] flex items-center justify-between shadow-inner">
                  <input
                    id="input-brand-industry"
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="bg-transparent font-mono text-xs text-[#c5c6ca] outline-none w-full"
                  />
                  <span className="font-mono text-[8px] text-[#8f9194]">SYS</span>
                </div>
              </div>
            </div>

            {/* Mission Mandate Well */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider">
                  Aesthetic Mandate / Brand Vision
                </label>
                <span className="font-mono text-[8px] text-[#8f9194]">PAYLOAD</span>
              </div>
              <div className="bg-[#0c0e12] p-2 rounded-[1px] border border-[#232936] shadow-inner flex items-start gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#8f9194] mt-0.5 shrink-0" />
                <textarea
                  id="input-brand-description"
                  rows={2}
                  value={formData.brand_description}
                  onChange={(e) => setFormData({ ...formData, brand_description: e.target.value })}
                  className="bg-transparent font-mono text-xs text-[#eef1f7] outline-none w-full resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Target Audience Well */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider">
                Target Demographic Array
              </label>
              <div className="bg-[#0c0e12] p-2 rounded-[1px] border border-[#232936] shadow-inner">
                <input
                  id="input-target-audience"
                  type="text"
                  value={formData.target_audience || ""}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  className="bg-transparent font-mono text-xs text-[#eef1f7] outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Unit 02 // Spectral Color Matrix */}
          <div className="bg-[#111317] p-4 rounded-lg border border-[#232936] shadow-sm flex flex-col gap-3 relative">
            <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between pb-1 border-b border-[#232936]/60">
              <span className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider">
                UNIT 02 // SPECTRAL COLOR MATRIX
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#8f9194]">
                <span>D65 ILLUM</span>
                <span>•</span>
                <span className="text-[#4edea3]">CALIBRATED</span>
              </div>
            </div>

            {/* Primary & Secondary Color Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Primary Color Picker */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[9px] text-[#8f9194] uppercase">
                  Primary Core Accent
                </label>
                <div className="bg-[#0c0e12] p-1.5 rounded-[1px] border border-[#232936] flex items-center gap-2">
                  <input
                    id="picker-primary-color"
                    type="color"
                    value={formData.primary_colour}
                    onChange={(e) => setFormData({ ...formData, primary_colour: e.target.value })}
                    className="w-6 h-6 rounded-[1px] bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primary_colour}
                    onChange={(e) => setFormData({ ...formData, primary_colour: e.target.value })}
                    className="bg-transparent font-mono text-xs text-[#eef1f7] outline-none w-full uppercase"
                  />
                </div>
              </div>

              {/* Supporting Secondary Tones */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[9px] text-[#8f9194] uppercase">
                  Supporting Tones (Hex)
                </label>
                <div className="bg-[#0c0e12] p-1.5 rounded-[1px] border border-[#232936] flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.secondary_colours.join(", ")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondary_colours: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    className="bg-transparent font-mono text-xs text-[#eef1f7] outline-none w-full uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Swatch Array Rack */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* Primary Swatch */}
              <div className="bg-[#0c0e12] p-2 rounded-[1px] border border-[#232936] flex flex-col gap-1.5">
                <div
                  className="w-full h-12 rounded-[1px] relative overflow-hidden flex items-end p-1 border border-black/40"
                  style={{ backgroundColor: formData.primary_colour }}
                >
                  <span className="font-mono text-[8px] font-bold px-1 bg-[#0c0e12]/80 text-white rounded-[1px]">
                    CORE
                  </span>
                </div>
                <div className="flex justify-between items-center font-mono text-[9px]">
                  <span className="text-[#8f9194]">HEX</span>
                  <span className="text-[#eef1f7] font-semibold">{formData.primary_colour.toUpperCase()}</span>
                </div>
                <div className="h-1 bg-[#1e2024] rounded-full overflow-hidden">
                  <div className="h-full bg-[#4edea3] w-[95%]" />
                </div>
              </div>

              {/* Secondary Swatches */}
              {formData.secondary_colours.map((col, idx) => (
                <div key={idx} className="bg-[#0c0e12] p-2 rounded-[1px] border border-[#232936] flex flex-col gap-1.5">
                  <div
                    className="w-full h-12 rounded-[1px] relative overflow-hidden flex items-end p-1 border border-black/40"
                    style={{ backgroundColor: col }}
                  >
                    <span className="font-mono text-[8px] font-bold px-1 bg-[#0c0e12]/80 text-white rounded-[1px]">
                      SEC_{idx + 1}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-mono text-[9px]">
                    <span className="text-[#8f9194]">HEX</span>
                    <span className="text-[#eef1f7] font-semibold">{col.toUpperCase()}</span>
                  </div>
                  <div className="h-1 bg-[#1e2024] rounded-full overflow-hidden">
                    <div className="h-full bg-[#8f9194] w-[60%]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Logo Anchor Matrix, Typography, Guidelines */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Unit 03 // Logo & Watermark Anchor Matrix */}
          <div className="bg-[#111317] p-4 rounded-lg border border-[#232936] shadow-sm flex flex-col gap-3 relative">
            <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between pb-1 border-b border-[#232936]/60">
              <span className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider">
                UNIT 03 // LOGO QUADRANT ANCHOR
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer font-mono text-[9px] text-[#c5c6ca]">
                <input
                  id="toggle-always-include-logo"
                  type="checkbox"
                  checked={formData.auto_include_logo}
                  onChange={(e) => setFormData({ ...formData, auto_include_logo: e.target.checked })}
                  className="rounded-[1px] bg-[#0c0e12] border-[#232936] text-[#4edea3] focus:ring-0"
                />
                AUTO OVERLAY
              </label>
            </div>

            {/* Logo Preview & URL */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[2px] bg-[#0c0e12] border border-[#232936] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {formData.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Upload className="w-4 h-4 text-[#8f9194]" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <input
                  id="input-logo-url"
                  type="text"
                  placeholder="https://... logo URL (PNG/SVG)"
                  value={formData.logo_url || ""}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#0c0e12] border border-[#232936] rounded-[1px] font-mono text-[10px] text-[#eef1f7] focus:outline-none focus:border-[#333842]"
                />
                <p className="font-mono text-[8px] text-[#8f9194]">Alpha-channel PNG or SVG recommended</p>
              </div>
            </div>

            {/* Tactical 4-Quadrant Anchor Rocker */}
            {formData.auto_include_logo && (
              <div className="space-y-1.5 pt-1">
                <span className="font-mono text-[9px] text-[#8f9194] uppercase block">
                  Anchor Placement Position
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {LOGO_POSITIONS.map((pos) => {
                    const isSelected = formData.logo_position === pos.key;
                    return (
                      <button
                        key={pos.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, logo_position: pos.key })}
                        className={`px-2.5 py-1.5 rounded-[1px] font-mono text-[9px] uppercase border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-[#1e2024] text-[#eef1f7] border-[#333842] shadow-sm font-semibold"
                            : "bg-[#0c0e12] text-[#8f9194] border-[#232936] hover:text-[#c5c6ca]"
                        }`}
                      >
                        <span>{pos.label}</span>
                        <span className="text-[8px] px-1 bg-[#111317] border border-[#232936]">
                          {pos.quadrant}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Unit 04 // Tone Matrix & Typography Rules */}
          <div className="bg-[#111317] p-4 rounded-lg border border-[#232936] shadow-sm flex flex-col gap-3 relative">
            <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between pb-1 border-b border-[#232936]/60">
              <span className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider">
                UNIT 04 // TONE ARRAY & TYPOGRAPHY
              </span>
            </div>

            {/* Tone Selector Buttons */}
            <div className="space-y-1">
              <span className="font-mono text-[9px] text-[#8f9194] uppercase">
                Dynamic Tone Vectors
              </span>
              <div className="flex flex-wrap gap-1">
                {ALL_TONES.map((tone) => {
                  const isSelected = formData.tone_of_voice.includes(tone);
                  return (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => handleToneToggle(tone)}
                      className={`px-2.5 py-1 rounded-[1px] font-mono text-[9px] uppercase tracking-wider border transition-all ${
                        isSelected
                          ? "bg-[#1e2024] text-[#4edea3] border-[#333842] font-semibold"
                          : "bg-[#0c0e12] text-[#8f9194] border-[#232936] hover:text-[#c5c6ca]"
                      }`}
                    >
                      {tone}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-1 pt-1">
              <span className="font-mono text-[9px] text-[#8f9194] uppercase">
                Calibrated Typeface Spec
              </span>
              <div className="bg-[#0c0e12] p-1.5 rounded-[1px] border border-[#232936] shadow-inner">
                <input
                  type="text"
                  placeholder="e.g. Geist / JetBrains Mono / Inter"
                  value={formData.typography || ""}
                  onChange={(e) => setFormData({ ...formData, typography: e.target.value })}
                  className="bg-transparent font-mono text-xs text-[#eef1f7] outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Unit 05 // Brand Directives & Guidelines Well */}
          <div className="bg-[#111317] p-4 rounded-lg border border-[#232936] shadow-sm flex flex-col gap-3 relative">
            <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between pb-1 border-b border-[#232936]/60">
              <span className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider">
                UNIT 05 // GUIDELINES MATRIX
              </span>
              {guidelinesParsed && (
                <span className="font-mono text-[9px] text-[#4edea3] flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> LOCKED
                </span>
              )}
            </div>

            <div className="p-3 rounded-[1px] border border-dashed border-[#232936] bg-[#0c0e12] flex flex-col items-center justify-center text-center space-y-1.5">
              <FileText className="w-5 h-5 text-[#8f9194]" />
              <div className="font-mono text-[10px] text-[#eef1f7]">
                {guidelinesFileName || "Drag & Drop Brand Guidelines (PDF/TXT)"}
              </div>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleGuidelinesUpload}
                className="hidden"
                id="guidelines-file-input"
              />
              <label
                htmlFor="guidelines-file-input"
                className="px-2.5 py-1 rounded-[1px] bg-[#1e2024] hover:bg-[#282a2e] text-[#eef1f7] font-mono text-[9px] uppercase tracking-wider cursor-pointer border border-[#333842] transition-colors"
              >
                {isParsing ? "EXTRACTING DIRECTIVES..." : "UPLOAD DIRECTIVES"}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
