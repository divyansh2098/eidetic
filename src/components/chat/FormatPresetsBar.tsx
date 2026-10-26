"use client";

import React, { useState, useRef, useEffect } from "react";
import { FORMAT_PRESETS, parseCustomRatio } from "@/lib/utils/format-presets";
import { FormatPreset } from "@/types/database";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FormatPresetsBarProps {
  selectedPreset: FormatPreset;
  onSelectPreset: (preset: FormatPreset, customRatio?: string) => void;
  customRatio: string;
  setCustomRatio: (val: string) => void;
}

export function FormatPresetsBar({
  selectedPreset,
  onSelectPreset,
  customRatio,
  setCustomRatio,
}: FormatPresetsBarProps) {
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [ratioInput, setRatioInput] = useState(customRatio || "5:3");
  const [customError, setCustomError] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -180 : 180;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  const handleApplyCustom = () => {
    const parsed = parseCustomRatio(ratioInput);
    if (!parsed) {
      setCustomError("Format must be W:H (e.g. 5:3 or 4:5)");
      return;
    }
    setCustomError("");
    setCustomRatio(ratioInput);
    setIsEditingCustom(false);
    onSelectPreset("custom", ratioInput);
  };

  return (
    <div className="w-full flex flex-col gap-2" id="format-presets-container">
      {/* Container with Left/Right Buttons and Hidden Scrollbar */}
      <div className="flex items-center gap-1.5 w-full">
        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
            canScrollLeft
              ? "bg-white hover:bg-[#f1f3f9] text-[#181c20] border-[#e0e2e8] shadow-sm"
              : "opacity-30 cursor-not-allowed bg-transparent text-[#777587] border-transparent"
          }`}
          title="Scroll presets left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Pill List */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex-1 flex items-center gap-1.5 bg-[#f1f3f9] p-1 rounded-full border border-[#e0e2e8] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        >
          {FORMAT_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.key;
            const displayLabel =
              preset.key === "custom" && customRatio
                ? `Custom (${customRatio})`
                : preset.key === "instagram_post"
                ? "1:1 Square"
                : preset.key === "instagram_story"
                ? "9:16 Story"
                : preset.key === "wide_banner"
                ? "16:9 Banner"
                : preset.label;

            return (
              <button
                key={preset.key}
                id={`preset-${preset.key}`}
                type="button"
                onClick={() => {
                  if (preset.key === "custom") {
                    setIsEditingCustom(true);
                  } else {
                    setIsEditingCustom(false);
                  }
                  onSelectPreset(preset.key);
                }}
                className={`shrink-0 h-8 px-3.5 rounded-full font-['Space_Grotesk'] text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[#5046e5] text-white shadow-sm"
                    : "text-[#464555] hover:text-[#181c20] hover:bg-white"
                }`}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                <span>{displayLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          type="button"
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight}
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
            canScrollRight
              ? "bg-white hover:bg-[#f1f3f9] text-[#181c20] border-[#e0e2e8] shadow-sm"
              : "opacity-30 cursor-not-allowed bg-transparent text-[#777587] border-transparent"
          }`}
          title="Scroll presets right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Inline Custom Ratio Editor */}
      {selectedPreset === "custom" && isEditingCustom && (
        <div
          id="custom-ratio-editor"
          className="flex items-center gap-2 p-2.5 bg-white rounded-2xl border border-[#e0e2e8] font-['Space_Grotesk'] text-xs shadow-sm"
        >
          <span className="text-[#464555] font-mono text-xs">Ratio [W:H]:</span>
          <input
            id="custom-ratio-input"
            type="text"
            value={ratioInput}
            onChange={(e) => {
              setRatioInput(e.target.value);
              setCustomError("");
            }}
            placeholder="4:5"
            className="w-20 px-2 py-1 bg-[#f1f3f9] border border-[#e0e2e8] text-center text-[#181c20] rounded-lg font-mono outline-none focus:border-[#5046e5]"
          />
          <button
            id="apply-custom-ratio-btn"
            type="button"
            onClick={handleApplyCustom}
            className="px-3 py-1 bg-[#5046e5] hover:bg-[#4338ca] text-white font-semibold rounded-full transition-colors cursor-pointer"
          >
            Apply
          </button>
          {customError && <span className="text-red-600 text-xs">{customError}</span>}
        </div>
      )}
    </div>
  );
}
