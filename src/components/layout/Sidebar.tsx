"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Settings,
  ChevronDown,
  Plus,
  X,
  Pencil,
  Check,
  Palette,
  Image,
  Paintbrush,
  Images,
  Layers,
  LogOut,
} from "lucide-react";
import { BrandProfile, Conversation } from "@/types/database";

interface SidebarProps {
  currentTab: "chat" | "assets" | "brand" | "settings";
  setCurrentTab: (tab: "chat" | "assets" | "brand" | "settings") => void;
  brands: BrandProfile[];
  activeBrand: BrandProfile | null;
  onSelectBrand: (brand: BrandProfile) => void;
  onAddNewBrand: () => void;
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
  const [, setUserEmail] = useState<string | null>(null);

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

  return (
    <aside
      className="w-64 h-full bg-white border-r border-[#e0e2e8] shadow-[0_4px_20px_-2px_rgba(80,70,229,0.04)] flex flex-col justify-between p-4 shrink-0 select-none relative z-40 overflow-y-auto"
      id="main-sidebar"
    >
      <div className="space-y-5">
        {/* Top Brand Logo */}
        <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#5046e5] flex items-center justify-center text-white shadow-[0_4px_12px_-2px_rgba(80,70,229,0.35)] group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-['Space_Grotesk'] font-bold text-lg tracking-tight text-[#181c20]">
              Eidetic
            </span>
          </Link>
        </div>

        {/* New Graphic Primary Action Button */}
        <div>
          <button
            type="button"
            onClick={onNewConversation}
            className="w-full h-11 bg-[#5046e5] hover:bg-[#4338ca] text-white font-['Space_Grotesk'] text-xs font-semibold rounded-full shadow-[0_8px_20px_-4px_rgba(80,70,229,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Graphic</span>
          </button>
        </div>

        {/* Active DNA Profile Card */}
        <div className="bg-[#f1f3f9] rounded-2xl p-3.5 border border-[#e0e2e8] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-[#464555] font-bold tracking-wider">
              Active Brand
            </span>
            <Palette className="w-3.5 h-3.5 text-[#5046e5]" />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
              className="w-full flex items-center justify-between text-left font-['Space_Grotesk'] text-xs font-bold text-[#181c20] hover:text-[#5046e5] transition-colors"
            >
              <span className="truncate">{activeBrand?.brand_name || "Select Brand"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#464555]" />
            </button>

            {brandDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e0e2e8] rounded-xl shadow-lg p-1 z-50">
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectBrand(b);
                      setBrandDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-['Space_Grotesk'] font-semibold transition-colors flex items-center justify-between ${
                      b.id === activeBrand?.id ? "bg-[#e2dfff] text-[#3422cc]" : "text-[#181c20] hover:bg-[#f1f3f9]"
                    }`}
                  >
                    <span className="truncate">{b.brand_name}</span>
                    {b.id === activeBrand?.id && <Check className="w-3 h-3" />}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setBrandDropdownOpen(false);
                    onAddNewBrand();
                  }}
                  className="w-full text-left px-3 py-1.5 mt-1 pt-1.5 border-t border-[#e0e2e8] rounded-lg text-xs font-['Space_Grotesk'] text-[#5046e5] font-semibold hover:bg-[#f1f3f9] flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Brand Profile</span>
                </button>
              </div>
            )}
          </div>

          {/* Color Swatch Dots */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: activeBrand?.primary_colour || "#5046e5" }}
            />
            {activeBrand?.secondary_colours.map((c, i) => (
              <div key={i} className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        {/* Studio Navigation Pills */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setCurrentTab("chat")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-['Space_Grotesk'] font-semibold transition-all ${
              currentTab === "chat"
                ? "bg-[#e2dfff] text-[#3422cc] shadow-sm"
                : "text-[#464555] hover:text-[#181c20] hover:bg-[#f1f3f9]"
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span>Studio Canvas</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("brand")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-['Space_Grotesk'] font-semibold transition-all ${
              currentTab === "brand"
                ? "bg-[#e2dfff] text-[#3422cc] shadow-sm"
                : "text-[#464555] hover:text-[#181c20] hover:bg-[#f1f3f9]"
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Brand DNA</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("assets")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-['Space_Grotesk'] font-semibold transition-all ${
              currentTab === "assets"
                ? "bg-[#e2dfff] text-[#3422cc] shadow-sm"
                : "text-[#464555] hover:text-[#181c20] hover:bg-[#f1f3f9]"
            }`}
          >
            <Images className="w-4 h-4" />
            <span>Asset Archive</span>
          </button>
        </div>

        {/* Recent Generations / Multi-turn Sessions */}
        <div className="space-y-2 pt-2">
          <div className="font-mono text-[10px] uppercase text-[#464555] font-bold px-1">
            Recent Sessions
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {conversations.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-[#464555] italic">
                No active sessions
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const isEditing = editingConvId === conv.id;

                return (
                  <div
                    key={conv.id}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-['Space_Grotesk'] transition-all ${
                      isActive
                        ? "bg-[#f1f3f9] text-[#181c20] font-bold shadow-sm"
                        : "text-[#464555] hover:text-[#181c20] hover:bg-[#f1f3f9]"
                    }`}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => {
                          if (editTitle.trim() && onRenameConversation) {
                            onRenameConversation(conv.id, editTitle.trim());
                          }
                          setEditingConvId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (editTitle.trim() && onRenameConversation) {
                              onRenameConversation(conv.id, editTitle.trim());
                            }
                            setEditingConvId(null);
                          }
                        }}
                        autoFocus
                        className="w-full bg-white px-2 py-0.5 rounded border border-[#5046e5] text-xs outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectConversation) onSelectConversation(conv.id);
                          setCurrentTab("chat");
                        }}
                        className="flex items-center gap-2 truncate flex-1 text-left"
                      >
                        <Image className="w-3.5 h-3.5 text-[#5046e5] shrink-0" />
                        <span className="truncate">{conv.title || "Untitled Session"}</span>
                      </button>
                    )}

                    <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingConvId(conv.id);
                          setEditTitle(conv.title || "");
                        }}
                        className="p-1 hover:text-[#181c20] text-[#464555]"
                        title="Rename session"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      {onDeleteConversation && (
                        <button
                          type="button"
                          onClick={() => onDeleteConversation(conv.id)}
                          className="p-1 hover:text-red-600 text-[#464555]"
                          title="Delete session"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="space-y-2 pt-4 border-t border-[#e0e2e8]">
        <button
          type="button"
          onClick={() => setCurrentTab("settings")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-['Space_Grotesk'] font-semibold transition-all ${
            currentTab === "settings"
              ? "bg-[#e2dfff] text-[#3422cc]"
              : "text-[#464555] hover:text-[#181c20] hover:bg-[#f1f3f9]"
          }`}
        >
          <Settings className="w-4 h-4 text-[#464555]" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-['Space_Grotesk'] font-semibold text-[#464555] hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
