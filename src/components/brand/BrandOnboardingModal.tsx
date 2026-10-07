"use client";

import React, { useState } from "react";
import { BrandProfile, ToneOfVoice, LogoPosition } from "@/types/database";
import { generateUUID } from "@/lib/utils/uuid";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Cpu,
  Layers,
  Terminal,
} from "lucide-react";

interface BrandOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newBrand: BrandProfile) => Promise<void> | void;
  tenantId: string;
}

const COLOR_PALETTES = [
  { name: "Emerald & Pine", primary: "#10B981", secondaries: ["#064E3B", "#34D399"] },
  { name: "Electric Indigo", primary: "#6366F1", secondaries: ["#1E1B4B", "#818CF8"] },
  { name: "Amber Glow", primary: "#F59E0B", secondaries: ["#78350F", "#FCD34D"] },
  { name: "Rose Modern", primary: "#F43F5E", secondaries: ["#881337", "#FB7185"] },
  { name: "Cyan Tech", primary: "#06B6D4", secondaries: ["#083344", "#67E8F9"] },
  { name: "Nordic Slate", primary: "#64748B", secondaries: ["#0F172A", "#94A3B8"] },
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
  "Clean Energy & Sustainability",
  "Specialty Coffee & F&B",
  "Software & SaaS",
  "Fitness & Wellness",
  "E-Commerce & Retail",
  "Financial Technology",
  "Creative & Design Agency",
  "Healthcare & Life Sciences",
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

  // Form State
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [description, setDescription] = useState("");
  const [primaryColour, setPrimaryColour] = useState("#10B981");
  const [secondaryColours, setSecondaryColours] = useState(["#064E3B", "#34D399"]);
  const [typography, setTypography] = useState("Geist / JetBrains Mono");
  const [selectedTones, setSelectedTones] = useState<ToneOfVoice[]>(["bold", "minimalist"]);
  const [targetAudience, setTargetAudience] = useState("");
  const [autoIncludeLogo, setAutoIncludeLogo] = useState(true);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>("bottom-right");

  if (!isOpen) return null;

  const toggleTone = (tag: ToneOfVoice) => {
    if (selectedTones.includes(tag)) {
      setSelectedTones(selectedTones.filter((t) => t !== tag));
    } else {
      setSelectedTones([...selectedTones, tag]);
    }
  };

  const handleFinish = async () => {
    const finalName = brandName.trim() || "My Brand";
    const newBrand: BrandProfile = {
      id: generateUUID(),
      tenant_id: tenantId,
      brand_name: finalName,
      logo_url: null,
      primary_colour: primaryColour,
      secondary_colours: secondaryColours,
      typography,
      brand_description: description.trim() || "Precision brand identity with modern visual standards.",
      industry,
      tone_of_voice: selectedTones.length > 0 ? selectedTones : ["professional", "minimalist"],
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
      console.error("Brand creation error:", err);
      setSaveError(err.message || "Failed to save brand profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-xl bg-[#111317] border border-[#333842] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
        id="brand-onboarding-modal"
      >
        {/* Top Specular Edge */}
        <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* Modal Header Rail */}
        <div className="p-4 border-b border-[#232936] flex items-center justify-between bg-[#111317]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[2px] bg-[#1e2024] border border-[#333842] flex items-center justify-center text-[#4edea3]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-[#eef1f7] font-semibold">
                CALIBRATE BRAND SPECIFICATION
              </h2>
              <p className="font-mono text-[9px] text-[#8f9194]">
                PHASE 0{step} OF 03 // {step === 1 ? "ENTITY PARAMETERS" : step === 2 ? "SPECTRAL MATRIX" : "VOICE & ANCHORS"}
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

        {/* Step Progress Wire */}
        <div className="grid grid-cols-3 h-[2px] bg-[#1e2024]">
          <div className={`h-full transition-all duration-300 ${step >= 1 ? "bg-[#4edea3]" : "bg-transparent"}`} />
          <div className={`h-full transition-all duration-300 ${step >= 2 ? "bg-[#4edea3]" : "bg-transparent"}`} />
          <div className={`h-full transition-all duration-300 ${step >= 3 ? "bg-[#4edea3]" : "bg-transparent"}`} />
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-[#eef1f7]">
          {step === 1 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider">
                  Brand Designation *
                </label>
                <div className="bg-[#0c0e12] p-2 rounded-[1px] border border-[#232936] shadow-inner">
                  <input
                    type="text"
                    placeholder="e.g. Aesthete Architecture"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs text-[#eef1f7] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider">
                  Industry / Sub-Tier
                </label>
                <div className="bg-[#0c0e12] p-1.5 rounded-[1px] border border-[#232936]">
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs text-[#eef1f7] outline-none cursor-pointer"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind} className="bg-[#111317] text-[#eef1f7]">
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider">
                  Mandate / Mission Description
                </label>
                <div className="bg-[#0c0e12] p-2 rounded-[1px] border border-[#232936] shadow-inner">
                  <textarea
                    rows={3}
                    placeholder="Describe aesthetic mission, visual ethos, and product essence..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs text-[#eef1f7] outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] text-[#8f9194] uppercase">
                  Select Calibrated Spectral Preset
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PALETTES.map((pal) => (
                    <button
                      key={pal.name}
                      type="button"
                      onClick={() => {
                        setPrimaryColour(pal.primary);
                        setSecondaryColours(pal.secondaries);
                      }}
                      className={`p-2 rounded-[1px] border text-left transition-all ${
                        primaryColour === pal.primary
                          ? "bg-[#1e2024] border-[#4edea3]"
                          : "bg-[#0c0e12] border-[#232936] hover:border-[#333842]"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div
                          className="w-3.5 h-3.5 rounded-[1px] border border-black/50"
                          style={{ backgroundColor: pal.primary }}
                        />
                        {pal.secondaries.map((sec, i) => (
                          <div
                            key={i}
                            className="w-3.5 h-3.5 rounded-[1px] border border-black/50"
                            style={{ backgroundColor: sec }}
                          />
                        ))}
                      </div>
                      <div className="font-mono text-[10px] text-[#eef1f7] truncate">{pal.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-1">
                <label className="font-mono text-[9px] text-[#8f9194] uppercase">
                  Typography Spec
                </label>
                <div className="bg-[#0c0e12] p-2 rounded-[1px] border border-[#232936] shadow-inner">
                  <input
                    type="text"
                    value={typography}
                    onChange={(e) => setTypography(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs text-[#eef1f7] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] text-[#8f9194] uppercase">
                  Tone Vector Descriptors
                </span>
                <div className="flex flex-wrap gap-1">
                  {TONE_TAGS.map((tag) => {
                    const isSelected = selectedTones.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTone(tag)}
                        className={`px-2.5 py-1 rounded-[1px] font-mono text-[9px] uppercase tracking-wider border transition-all ${
                          isSelected
                            ? "bg-[#1e2024] text-[#4edea3] border-[#333842] font-semibold"
                            : "bg-[#0c0e12] text-[#8f9194] border-[#232936] hover:text-[#c5c6ca]"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-1">
                <label className="font-mono text-[9px] text-[#8f9194] uppercase">
                  Target Audience
                </label>
                <div className="bg-[#0c0e12] p-2 rounded-[1px] border border-[#232936] shadow-inner">
                  <input
                    type="text"
                    placeholder="e.g. Architects, design collectors"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs text-[#eef1f7] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {saveError && (
            <div className="p-2 bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-[1px] font-mono text-[10px] text-[#ffb4ab]">
              {saveError}
            </div>
          )}
        </div>

        {/* Modal Navigation Footer */}
        <div className="p-3 border-t border-[#232936] flex items-center justify-between bg-[#111317]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="h-8 px-3 rounded-[1px] bg-[#1e2024] hover:bg-[#282a2e] text-[#c5c6ca] font-mono text-[10px] uppercase tracking-wider border border-[#333842] flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              BACK
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="h-8 px-4 rounded-[1px] bg-[#eef1f7] hover:bg-white text-[#0c0e12] font-mono text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1 active:translate-y-[1px]"
            >
              NEXT
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleFinish}
              className="h-8 px-4 rounded-[1px] bg-[#eef1f7] hover:bg-white text-[#0c0e12] font-mono text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1 active:translate-y-[1px]"
            >
              {isSaving ? "LOCKING SPEC..." : "FINALIZE SPEC"}
              <Check className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
