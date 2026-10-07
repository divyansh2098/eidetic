"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  FolderOpen,
  Settings,
  ChevronDown,
  Plus,
  ExternalLink,
  Layers,
  Zap,
  X,
  Pencil,
  Check,
  Terminal,
  Activity,
  Maximize2,
  Cpu,
} from "lucide-react";
import { BrandProfile, Conversation } from "@/types/database";

interface SidebarProps {
  currentTab: "chat" | "assets" | "brand" | "settings";
  setCurrentTab: (tab: "chat" | "assets" | "brand" | "settings") => void;
  brands: BrandProfile[];
  activeBrand: BrandProfile | null;
  onSelectBrand: (brand: BrandProfile) => void;
  onAddNewBrand: () => void;
  usageCount: number;
  usageLimit: number;
  canvaConnected: boolean;
  onOpenUpgrade?: () => void;
  conversations?: Conversation[];
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onNewConversation?: () => void;
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
}

export function Sidebar({
  currentTab,
  setCurrentTab,
  brands,
  activeBrand,
  onSelectBrand,
  onAddNewBrand,
  usageCount,
  usageLimit,
  canvaConnected,
  onOpenUpgrade,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
}: SidebarProps) {
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.email) {
          setUserEmail(data.user.email);
        }
      });
    } catch {}
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const usagePercent = Math.min(100, Math.round((usageCount / usageLimit) * 100));

  return (
    <aside
      className="w-64 h-full bg-[#111317] border-r border-[#232936] flex flex-col justify-between p-3.5 shrink-0 select-none relative z-30"
      id="main-sidebar"
    >
      <div className="space-y-4">
        {/* Brand Logo & Precision Header */}
        <div className="flex items-center justify-between px-1.5 pt-1 pb-2 border-b border-[#232936]/70">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[2px] bg-[#1e2024] border border-[#333842] flex items-center justify-center shadow-inner">
              <Cpu className="w-3 h-3 text-[#eef1f7]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs tracking-[0.25em] text-[#eef1f7] font-semibold uppercase">
                EIDETIC
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.8)]" />
            </div>
          </div>
          <span className="font-mono text-[10px] text-[#8f9194] tracking-wider uppercase">
            v2.4
          </span>
        </div>

        {/* Active Brand Switcher (Machined Well) */}
        <div className="relative">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#8f9194]">
              BRAND SPECIFICATION
            </span>
            <span className="font-mono text-[9px] text-[#4edea3]">DNA_01</span>
          </div>

          <button
            id="brand-switcher-btn"
            type="button"
            onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-[2px] bg-[#0c0e12] hover:bg-[#16181d] border border-[#232936] hover:border-[#333842] text-left transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
          >
            {activeBrand ? (
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-5 h-5 rounded-[1px] flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden border border-white/20 shadow-sm"
                  style={{ backgroundColor: activeBrand.primary_colour }}
                >
                  {activeBrand.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activeBrand.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    activeBrand.brand_name.charAt(0)
                  )}
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-[#eef1f7] tracking-tight truncate">
                    {activeBrand.brand_name}
                  </div>
                  <div className="font-mono text-[9px] text-[#8f9194] truncate">
                    {activeBrand.industry || "SYSTEM"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-[1px] flex items-center justify-center text-xs font-mono text-[#8f9194] bg-[#16181d] border border-dashed border-[#333842]">
                  +
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-[#eef1f7]">No Spec Loaded</div>
                  <div className="font-mono text-[9px] text-[#4edea3]">Click to calibrate</div>
                </div>
              </div>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-[#8f9194] shrink-0 ml-1" />
          </button>

          {/* Brand Switcher Dropdown */}
          {brandDropdownOpen && (
            <div
              id="brand-dropdown-menu"
              className="absolute left-0 right-0 mt-1.5 p-1 bg-[#111317] border border-[#333842] rounded-[2px] shadow-2xl z-50 animate-fadeIn"
            >
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => {
                      onSelectBrand(brand);
                      setBrandDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 p-1.5 rounded-[1px] text-left text-xs transition-colors ${
                      brand.id === activeBrand?.id
                        ? "bg-[#1e2024] text-[#eef1f7] font-medium border border-[#333842]"
                        : "text-[#c5c6ca] hover:bg-[#16181d] hover:text-white"
                    }`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-[1px] shrink-0 border border-black/50"
                      style={{ backgroundColor: brand.primary_colour }}
                    />
                    <span className="truncate">{brand.brand_name}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-[#232936] mt-1 pt-1">
                <button
                  id="add-brand-btn"
                  type="button"
                  onClick={() => {
                    onAddNewBrand();
                    setBrandDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-1.5 p-1.5 rounded-[1px] text-left font-mono text-[10px] text-[#4edea3] hover:bg-[#16181d] tracking-wider uppercase transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  + Calibrate New Spec
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items (Tactile Hardware Plates) */}
        <nav className="space-y-1 text-xs">
          <div className="px-1 pt-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194]">
              INSTRUMENT WORKBENCHES
            </span>
          </div>

          <button
            id="nav-chat-tab"
            type="button"
            onClick={() => setCurrentTab("chat")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[2px] transition-all font-medium ${
              currentTab === "chat"
                ? "bg-[#1e2024] text-[#eef1f7] border border-[#333842] shadow-sm"
                : "text-[#c5c6ca] hover:text-[#eef1f7] hover:bg-[#16181d] border border-transparent"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${currentTab === "chat" ? "bg-[#4edea3] shadow-[0_0_5px_rgba(78,222,163,0.9)]" : "bg-transparent"}`} />
            <span className="tracking-tight">Studio Precision Canvas</span>
          </button>

          {/* Campaign Sessions Sub-Drawer */}
          {currentTab === "chat" && (
            <div className="pt-1 pb-1 pl-3 pr-1 space-y-1 bg-[#0c0e12]/60 rounded-[2px] border border-[#232936]/60">
              <div className="flex items-center justify-between text-[10px] text-[#8f9194] font-mono px-1 py-0.5">
                <span>BUFFERS</span>
                {onNewConversation && (
                  <button
                    type="button"
                    onClick={onNewConversation}
                    className="flex items-center gap-1 text-[9px] font-mono text-[#4edea3] hover:text-[#6ffbbe] tracking-wider uppercase px-1 py-0.5 rounded-[1px] bg-[#16181d] border border-[#232936] transition-colors"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    NEW
                  </button>
                )}
              </div>

              <div className="space-y-0.5 max-h-36 overflow-y-auto">
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  const isEditing = editingConvId === conv.id;

                  const handleSaveRename = () => {
                    if (editTitle.trim()) {
                      onRenameConversation?.(conv.id, editTitle.trim());
                    }
                    setEditingConvId(null);
                  };

                  return (
                    <div
                      key={conv.id}
                      className={`group/conv w-full px-2 py-1 rounded-[1px] text-[11px] transition-colors flex items-center justify-between gap-1.5 ${
                        isActive
                          ? "bg-[#1e2024] text-[#eef1f7] font-medium border border-[#333842]"
                          : "text-[#8f9194] hover:text-[#c5c6ca] hover:bg-[#16181d]"
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <input
                            type="text"
                            value={editTitle}
                            autoFocus
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename();
                              if (e.key === "Escape") setEditingConvId(null);
                            }}
                            className="w-full bg-[#0c0e12] border border-[#4edea3] text-[#eef1f7] font-mono text-[10px] rounded-[1px] px-1 py-0.5 outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleSaveRename}
                            className="p-0.5 text-[#4edea3]"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingConvId(null)}
                            className="p-0.5 text-[#8f9194]"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onSelectConversation?.(conv.id)}
                            className="truncate flex-1 text-left font-mono text-[10px]"
                            title={conv.title}
                          >
                            {conv.title}
                          </button>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-mono text-[8px] uppercase px-1 rounded-[1px] bg-[#0c0e12] text-[#8f9194] border border-[#232936]">
                              {conv.format_preset === "instagram_post"
                                ? "1:1"
                                : conv.format_preset === "wide_banner"
                                ? "16:9"
                                : "RAW"}
                            </span>
                            {onRenameConversation && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingConvId(conv.id);
                                  setEditTitle(conv.title);
                                }}
                                className="opacity-0 group-hover/conv:opacity-100 p-0.5 text-[#8f9194] hover:text-white"
                                title="Rename buffer"
                              >
                                <Pencil className="w-2.5 h-2.5" />
                              </button>
                            )}
                            {onDeleteConversation && conversations.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteConversation(conv.id);
                                }}
                                className="opacity-0 group-hover/conv:opacity-100 p-0.5 text-[#8f9194] hover:text-[#ffb4ab]"
                                title="Purge buffer"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            id="nav-assets-tab"
            type="button"
            onClick={() => setCurrentTab("assets")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[2px] transition-all font-medium ${
              currentTab === "assets"
                ? "bg-[#1e2024] text-[#eef1f7] border border-[#333842] shadow-sm"
                : "text-[#c5c6ca] hover:text-[#eef1f7] hover:bg-[#16181d] border border-transparent"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${currentTab === "assets" ? "bg-[#4edea3] shadow-[0_0_5px_rgba(78,222,163,0.9)]" : "bg-transparent"}`} />
            <span className="tracking-tight">Asset Library & Archive</span>
          </button>

          <button
            id="nav-brand-tab"
            type="button"
            onClick={() => setCurrentTab("brand")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[2px] transition-all font-medium ${
              currentTab === "brand"
                ? "bg-[#1e2024] text-[#eef1f7] border border-[#333842] shadow-sm"
                : "text-[#c5c6ca] hover:text-[#eef1f7] hover:bg-[#16181d] border border-transparent"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${currentTab === "brand" ? "bg-[#4edea3] shadow-[0_0_5px_rgba(78,222,163,0.9)]" : "bg-transparent"}`} />
            <span className="tracking-tight">Brand DNA Matrix</span>
          </button>

          <button
            id="nav-settings-tab"
            type="button"
            onClick={() => setCurrentTab("settings")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[2px] transition-all font-medium ${
              currentTab === "settings"
                ? "bg-[#1e2024] text-[#eef1f7] border border-[#333842] shadow-sm"
                : "text-[#c5c6ca] hover:text-[#eef1f7] hover:bg-[#16181d] border border-transparent"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${currentTab === "settings" ? "bg-[#4edea3] shadow-[0_0_5px_rgba(78,222,163,0.9)]" : "bg-transparent"}`} />
            <div className="flex items-center justify-between w-full">
              <span className="tracking-tight">Telemetry & Settings</span>
              {canvaConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Canva Link Active" />
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Machine Telemetry Carrier & Account Readout */}
      <div className="space-y-3 pt-3 border-t border-[#232936]">
        {/* Quota Odometer Strip */}
        <div className="p-2 rounded-[2px] bg-[#0c0e12] border border-[#232936] space-y-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between font-mono text-[9px] text-[#8f9194]">
            <span className="flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-[#4edea3]" />
              ENGINE CYCLES
            </span>
            <span className="text-[#eef1f7]">
              {usageCount} / {usageLimit}
            </span>
          </div>
          <div className="w-full h-1 bg-[#1e2024] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4edea3] shadow-[0_0_4px_rgba(78,222,163,0.9)] transition-all duration-300"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {/* User Account Carrier */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-[2px] bg-[#1e2024] border border-[#333842] flex items-center justify-center font-mono text-[10px] text-[#eef1f7] uppercase font-semibold">
              {userEmail ? userEmail[0] : "E"}
            </div>
            <div className="truncate">
              <p className="font-mono text-[10px] text-[#eef1f7] truncate">
                {userEmail || "ENGINE_TENANT"}
              </p>
              <div className="flex items-center gap-1.5 font-mono text-[8px] text-[#8f9194]">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="hover:text-[#ffb4ab] transition-colors"
                >
                  DISCONNECT
                </button>
                <span>•</span>
                <Link href="/" className="hover:text-[#4edea3] transition-colors">
                  HOME
                </Link>
              </div>
            </div>
          </div>
          {onOpenUpgrade && (
            <button
              type="button"
              onClick={onOpenUpgrade}
              className="font-mono text-[9px] px-2 py-0.5 rounded-[1px] font-semibold bg-[#1e2024] text-[#4edea3] hover:bg-[#282a2e] border border-[#333842] transition-colors"
            >
              TIER
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
