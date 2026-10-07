"use client";

import React, { useState } from "react";
import { FORMAT_PRESETS, parseCustomRatio } from "@/lib/utils/format-presets";
import { FormatPreset } from "@/types/database";

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
    <div className="w-full flex flex-col gap-1.5" id="format-presets-container">
      {/* Segmented Rocker Dial */}
      <div className="flex items-center bg-[#0c0e12] p-0.5 rounded-[2px] border border-[#232936] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] overflow-x-auto no-scrollbar">
        {FORMAT_PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.key;
          const displayLabel =
            preset.key === "custom" && customRatio
              ? `CUSTOM (${customRatio})`
              : preset.key === "instagram_post"
              ? "1:1 SQ"
              : preset.key === "instagram_story"
              ? "9:16 VERT"
              : preset.key === "wide_banner"
              ? "16:9 BANNER"
              : preset.label.toUpperCase();

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
              className={`shrink-0 h-6 px-2.5 rounded-[1px] font-mono text-[10px] tracking-wider transition-all duration-75 flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[#1e2024] text-[#eef1f7] font-semibold border border-[#333842] shadow-sm"
                  : "text-[#8f9194] hover:text-[#eef1f7] hover:bg-[#16181d]"
              }`}
            >
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_4px_rgba(78,222,163,0.9)]" />
              )}
              <span>{displayLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Inline Custom Ratio Editor */}
      {selectedPreset === "custom" && isEditingCustom && (
        <div
          id="custom-ratio-editor"
          className="flex items-center gap-2 p-2 bg-[#0c0e12] rounded-[2px] border border-[#333842] font-mono text-[10px] animate-fadeIn"
        >
          <span className="text-[#8f9194]">RATIO [W:H]:</span>
          <input
            id="custom-ratio-input"
            type="text"
            value={ratioInput}
            onChange={(e) => {
              setRatioInput(e.target.value);
              setCustomError("");
            }}
            placeholder="5:3"
            className="w-16 px-1.5 py-0.5 bg-[#16181d] border border-[#232936] text-center text-[#eef1f7] rounded-[1px] focus:outline-none focus:border-[#4edea3]"
          />
          <button
            id="apply-custom-ratio-btn"
            type="button"
            onClick={handleApplyCustom}
            className="px-2 py-0.5 bg-[#1e2024] hover:bg-[#282a2e] text-[#4edea3] font-semibold rounded-[1px] border border-[#333842] transition-colors"
          >
            SET
          </button>
          <button
            type="button"
            onClick={() => setIsEditingCustom(false)}
            className="px-1.5 py-0.5 text-[#8f9194] hover:text-white"
          >
            CANCEL
          </button>
          {customError && <span className="text-[#ffb4ab] text-[9px]">{customError}</span>}
        </div>
      )}
    </div>
  );
}
