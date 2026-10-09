"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { FormatPresetsBar } from "@/components/chat/FormatPresetsBar";
import { GeneratedGraphicCard } from "@/components/chat/GeneratedGraphicCard";
import { LimitCard } from "@/components/chat/LimitCard";
import { AssetGallery } from "@/components/assets/AssetGallery";
import { BrandProfileView } from "@/components/brand/BrandProfileView";
import { SettingsView } from "@/components/settings/SettingsView";
import { BrandOnboardingModal } from "@/components/brand/BrandOnboardingModal";
import { UpgradeModal } from "@/components/settings/UpgradeModal";
import {
  getBrandProfiles,
  saveBrandProfile,
  getAssets,
  saveAsset,
  getChatSessions,
  saveChatSession,
  deleteChatSession,
  getMessages,
  saveMessage,
  isSupabaseConfigured,
  getCurrentUserAndTenant,
} from "@/lib/supabase/service";
import { BrandProfile, FormatPreset, Message, Asset, Conversation, AspectRatio } from "@/types/database";
import { getPresetByKey } from "@/lib/utils/format-presets";
import { buildSystemPrompt } from "@/lib/ai/prompt-builder";
import { generateUUID } from "@/lib/utils/uuid";
import {
  RotateCcw,
  Bot,
  User,
  ArrowUpRight,
  X,
  Code2,
  CheckCircle2,
  Plus,
  AlertCircle,
  Layers,
  Sparkles,
  Sliders,
  Crop,
  Terminal,
} from "lucide-react";

const PROMPT_SUGGESTIONS = [
  "Brushed titanium monolith on volcanic basalt pedestal, surgical strobe lighting",
  "Minimalist architectural glass pavilion with raw concrete geometry",
  "Matte dark luxury watch showcase with emerald optic reflection",
  "Clean industrial product packaging with embossed metallic typography",
];

export default function StudioPage() {
  const [currentTab, setCurrentTab] = useState<"chat" | "assets" | "brand" | "settings">("chat");
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [activeBrand, setActiveBrand] = useState<BrandProfile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<FormatPreset>("instagram_post");
  const [customRatio, setCustomRatio] = useState<string>("5:3");
  const [inputPrompt, setInputPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit] = useState(200);
  const [canvaConnected, setCanvaConnected] = useState(false);
  const [showCanvaModal, setShowCanvaModal] = useState(false);
  const [showSystemPromptModal, setShowSystemPromptModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("pro");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load initial state via Supabase service on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingData(true);
        const { tenantId: resolvedTenantId } = await getCurrentUserAndTenant();
        if (resolvedTenantId) {
          setTenantId(resolvedTenantId);
        }

        const loadedBrands = await getBrandProfiles(resolvedTenantId || undefined);
        setBrands(loadedBrands);

        if (loadedBrands.length > 0) {
          const brandToUse = loadedBrands[0];
          setActiveBrand(brandToUse);

          const loadedAssets = await getAssets(resolvedTenantId || undefined);
          setAssets(loadedAssets);

          const loadedSessions = await getChatSessions(resolvedTenantId || undefined, brandToUse.id);
          if (loadedSessions.length > 0) {
            setConversations(loadedSessions);
            const firstSession = loadedSessions[0];
            setActiveConversationId(firstSession.id);
            if (firstSession.format_preset) {
              setSelectedPreset(firstSession.format_preset as FormatPreset);
            }
            if (firstSession.aspect_ratio && !["1:1", "16:9", "9:16"].includes(firstSession.aspect_ratio)) {
              setCustomRatio(firstSession.aspect_ratio);
            }

            const sessionMsgs = await getMessages(firstSession.id);
            if (sessionMsgs.length > 0) {
              setMessages(sessionMsgs);
            } else {
              const welcomeMsg: Message = {
                id: generateUUID(),
                conversation_id: firstSession.id,
                tenant_id: brandToUse.tenant_id,
                brand_profile_id: brandToUse.id,
                role: "assistant",
                content: `Calibrated workspace ready for **${brandToUse.brand_name}**. Direct visual composition or choose an optical format preset below.`,
                image_url: null,
                asset_id: null,
                metadata: null,
                created_at: new Date().toISOString(),
              };
              setMessages([welcomeMsg]);
              saveMessage(welcomeMsg).catch(console.warn);
            }
          } else {
            setConversations([]);
            setMessages([]);
          }
        } else {
          setActiveBrand(null);
          setAssets([]);
          setConversations([]);
          setMessages([]);
        }
      } catch (err) {
        console.warn("Failed to load data from Supabase/cache:", err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem("eidetic_brands", JSON.stringify(brands));
    } catch { }
  }, [brands]);

  useEffect(() => {
    try {
      localStorage.setItem("eidetic_assets", JSON.stringify(assets));
    } catch { }
  }, [assets]);

  useEffect(() => {
    try {
      localStorage.setItem("eidetic_canva", JSON.stringify(canvaConnected));
    } catch { }
  }, [canvaConnected]);

  useEffect(() => {
    if (currentTab === "chat") {
      scrollToBottom();
    }
  }, [messages, currentTab]);

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputPrompt).trim();
    if (!promptToSend || isGenerating) return;

    if (!activeBrand) {
      alert("Please select or calibrate a brand specification first.");
      return;
    }

    // Check quota hard block
    if (usageCount >= usageLimit) {
      alert("Monthly limit reached. Please upgrade to continue generating graphics.");
      return;
    }

    const currentTenantId = activeBrand.tenant_id || tenantId || generateUUID();
    let currentSessionId = activeConversationId;

    // Auto-create session if none active
    if (!currentSessionId) {
      currentSessionId = generateUUID();
      const cleanPrompt = promptToSend.replace(/^["'\s]+|["'\s]+$/g, "");
      const newTitle = cleanPrompt.length > 34 ? `${cleanPrompt.slice(0, 31)}...` : cleanPrompt || "Buffer #01";
      const presetConfig = getPresetByKey(selectedPreset);
      const newSession: Conversation = {
        id: currentSessionId,
        tenant_id: currentTenantId,
        brand_profile_id: activeBrand.id,
        title: newTitle,
        format_preset: selectedPreset,
        aspect_ratio: (selectedPreset === "custom" && customRatio ? customRatio : presetConfig?.aspectRatio || "1:1") as AspectRatio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setConversations((prev) => [newSession, ...prev]);
      setActiveConversationId(currentSessionId);
      saveChatSession(newSession).catch((err) =>
        console.warn("Failed to create session on first message:", err)
      );
    }

    const userMessageId = generateUUID();
    const newUserMessage: Message = {
      id: userMessageId,
      conversation_id: currentSessionId,
      tenant_id: currentTenantId,
      brand_profile_id: activeBrand.id,
      role: "user",
      content: promptToSend,
      image_url: null,
      asset_id: null,
      metadata: {
        format_preset: selectedPreset,
        aspect_ratio: selectedPreset === "custom" ? "custom" : undefined,
      },
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputPrompt("");
    setIsGenerating(true);

    // Dynamically rename buffer if still default
    const currentConv = conversations.find((c) => c.id === currentSessionId);
    if (
      currentConv &&
      (currentConv.title.startsWith("Campaign Session #") ||
        currentConv.title.startsWith("New Campaign Session") ||
        currentConv.title.startsWith("Buffer #") ||
        currentConv.title === "New Session")
    ) {
      const cleanPrompt = promptToSend.replace(/^["'\s]+|["'\s]+$/g, "");
      const newTitle = cleanPrompt.length > 34 ? `${cleanPrompt.slice(0, 31)}...` : cleanPrompt;
      const updatedConv: Conversation = {
        ...currentConv,
        title: newTitle,
        updated_at: new Date().toISOString(),
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === currentSessionId ? updatedConv : c))
      );
      saveChatSession(updatedConv).catch((err) =>
        console.warn("Failed to update conversation title:", err)
      );
    }

    // Persist user message
    saveMessage(newUserMessage).catch((err) => console.warn("saveMessage user error:", err));

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSend,
          brandProfile: activeBrand,
          formatPreset: selectedPreset,
          customRatio: selectedPreset === "custom" ? customRatio : undefined,
          sessionId: currentSessionId,
          messageId: userMessageId,
        }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = { error: `Server error (${response.status}): ${response.statusText || "Generation failed"}` };
      }

      if (response.ok && data?.success) {
        const assistantMessageId = generateUUID();
        const newAssetId = data.assetId || generateUUID();
        const safeTenantId = currentTenantId;
        const safeBrandId = activeBrand.id;
        const presetConfig = getPresetByKey(selectedPreset);

        const newAssistantMessage: Message = {
          id: assistantMessageId,
          conversation_id: currentSessionId,
          tenant_id: safeTenantId,
          brand_profile_id: safeBrandId,
          role: "assistant",
          content: data.chatResponse,
          image_url: data.imageUrl || null,
          asset_id: data.assetId || null,
          metadata: data.metadata,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newAssistantMessage]);
        saveMessage(newAssistantMessage).catch((err) => console.warn("saveMessage assistant error:", err));

        if (data.imageUrl) {
          const newAsset: Asset = {
            id: newAssetId,
            tenant_id: safeTenantId,
            brand_profile_id: safeBrandId,
            message_id: assistantMessageId,
            storage_path: data.storagePath || `${safeTenantId}/${newAssetId}.${data.format || "png"}`,
            public_url: data.imageUrl,
            format: (data.format || "png") as "png" | "jpg" | "webp",
            width: presetConfig?.width || 1080,
            height: presetConfig?.height || 1080,
            aspect_ratio: (data.metadata?.aspect_ratio || presetConfig?.aspectRatio || "1:1") as AspectRatio,
            format_preset: selectedPreset,
            canva_design_id: null,
            canva_edit_url: null,
            canva_pushed_at: null,
            created_at: new Date().toISOString(),
          };

          setAssets((prev) => [newAsset, ...prev]);
          setUsageCount((prev) => prev + 1);

          saveAsset(newAsset, { sessionId: currentSessionId }).catch((err) =>
            console.warn("saveAsset background error:", err)
          );
        }
      } else {
        const errorDetail = data?.error || `Optical render failed (${response.status})`;
        const errorContent = data?.chatResponse
          ? `${data.chatResponse}\n\n⚠️ **Optical Synthesis Failed**\n${errorDetail}`
          : `⚠️ **Optical Synthesis Failed**\n\n${errorDetail}\n\nPlease check prompt or parameters and retry.`;

        const errorMessage: Message = {
          id: generateUUID(),
          conversation_id: currentSessionId,
          tenant_id: currentTenantId,
          brand_profile_id: activeBrand.id,
          role: "assistant",
          content: errorContent,
          image_url: null,
          asset_id: null,
          metadata: {
            error: errorDetail,
            format_preset: selectedPreset,
          },
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, errorMessage]);
        saveMessage(errorMessage).catch((e) => console.warn("saveMessage error message failed:", e));
      }
    } catch (err: any) {
      console.error("[StudioPage] handleSendMessage error:", err);
      if (activeBrand) {
        const errorMessage: Message = {
          id: generateUUID(),
          conversation_id: currentSessionId,
          tenant_id: currentTenantId,
          brand_profile_id: activeBrand.id,
          role: "assistant",
          content: `⚠️ **Optical Synthesis Failed**\n\n${err.message || "Failed to communicate with optical render engine."}`,
          image_url: null,
          asset_id: null,
          metadata: {
            error: err.message,
          },
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        saveMessage(errorMessage).catch((e) => console.warn("saveMessage error message failed:", e));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddNewBrand = () => {
    setShowOnboardingModal(true);
  };

  const handleOnboardingComplete = async (newBrand: BrandProfile) => {
    const saved = await saveBrandProfile(newBrand);
    setBrands((prev) => [saved, ...prev.filter((b) => b.id !== saved.id)]);
    setActiveBrand(saved);
    if (saved.tenant_id && !tenantId) {
      setTenantId(saved.tenant_id);
    }
    await handleSelectBrand(saved);
    setCurrentTab("chat");
  };

  const handleUpdateBrand = async (updated: BrandProfile) => {
    try {
      const saved = await saveBrandProfile(updated);
      setBrands((prev) => prev.map((b) => (b.id === saved.id ? saved : b)));
      setActiveBrand(saved);
    } catch (err: any) {
      console.error("updateBrandProfile error:", err);
      alert(`Failed to update brand profile: ${err.message || err}`);
    }
  };

  const handleSelectBrand = async (brand: BrandProfile) => {
    setActiveBrand(brand);
    try {
      const targetTenantId = brand.tenant_id || tenantId || generateUUID();
      const brandSessions = await getChatSessions(targetTenantId, brand.id);
      if (brandSessions.length > 0) {
        setConversations(brandSessions);
        const activeId = brandSessions[0].id;
        setActiveConversationId(activeId);
        const msgs = await getMessages(activeId);
        setMessages(msgs);
      } else {
        const newId = generateUUID();
        const initialConv: Conversation = {
          id: newId,
          tenant_id: targetTenantId,
          brand_profile_id: brand.id,
          title: `${brand.brand_name} Initial Buffer`,
          format_preset: "instagram_post",
          aspect_ratio: "1:1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const welcomeMsg: Message = {
          id: generateUUID(),
          conversation_id: newId,
          tenant_id: targetTenantId,
          brand_profile_id: brand.id,
          role: "assistant",
          content: `Calibrated workspace ready for **${brand.brand_name}**. Direct visual composition or choose an optical format preset below.`,
          image_url: null,
          asset_id: null,
          metadata: null,
          created_at: new Date().toISOString(),
        };
        setConversations([initialConv]);
        setActiveConversationId(newId);
        setMessages([welcomeMsg]);
        saveChatSession(initialConv).catch(console.warn);
        saveMessage(welcomeMsg).catch(console.warn);
      }
    } catch (e) {
      console.warn("Failed to load sessions for brand:", e);
    }
  };

  const handleSelectPreset = (preset: FormatPreset, ratio?: string) => {
    setSelectedPreset(preset);
    if (ratio) setCustomRatio(ratio);

    const currentConv = conversations.find((c) => c.id === activeConversationId);
    if (currentConv) {
      const presetConfig = getPresetByKey(preset);
      const updatedConv: Conversation = {
        ...currentConv,
        format_preset: preset,
        aspect_ratio: (ratio as AspectRatio) || presetConfig?.aspectRatio || currentConv.aspect_ratio || "1:1",
        updated_at: new Date().toISOString(),
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? updatedConv : c))
      );
      saveChatSession(updatedConv).catch((err) =>
        console.warn("Failed to persist conversation preset:", err)
      );
    }
  };

  const handleSelectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    const conv = conversations.find((c) => c.id === convId);
    if (conv?.format_preset) {
      setSelectedPreset(conv.format_preset as FormatPreset);
      if (conv.aspect_ratio && !["1:1", "16:9", "9:16"].includes(conv.aspect_ratio)) {
        setCustomRatio(conv.aspect_ratio);
      }
    }

    try {
      const msgs = await getMessages(convId);
      if (msgs.length > 0) {
        setMessages(msgs);
      } else {
        const welcomeMsg: Message = {
          id: generateUUID(),
          conversation_id: convId,
          tenant_id: conv?.tenant_id || tenantId || generateUUID(),
          brand_profile_id: conv?.brand_profile_id || activeBrand?.id || "",
          role: "assistant",
          content: activeBrand
            ? `Buffer **${conv?.title || "Buffer"}** loaded for **${activeBrand.brand_name}**. Direct visual specification below.`
            : `Buffer active. Direct visual specification below.`,
          image_url: null,
          asset_id: null,
          metadata: null,
          created_at: new Date().toISOString(),
        };
        setMessages([welcomeMsg]);
        saveMessage(welcomeMsg).catch(console.warn);
      }
    } catch (e) {
      console.warn("Failed to load messages for conversation:", e);
    }
  };

  const handleRenameConversation = async (convId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const target = conversations.find((c) => c.id === convId);
    if (!target || target.title === trimmed) return;

    const updated: Conversation = {
      ...target,
      title: trimmed,
      updated_at: new Date().toISOString(),
    };
    setConversations((prev) => prev.map((c) => (c.id === convId ? updated : c)));
    try {
      await saveChatSession(updated);
    } catch (err) {
      console.warn("Failed to save renamed conversation:", err);
    }
  };

  const handleResetConversation = async () => {
    if (!activeBrand) return;
    if (!confirm("Are you sure you want to reset this buffer session?")) return;
    const targetTenantId = activeBrand.tenant_id || tenantId || generateUUID();
    const welcomeMsg: Message = {
      id: generateUUID(),
      conversation_id: activeConversationId,
      tenant_id: targetTenantId,
      brand_profile_id: activeBrand.id,
      role: "assistant",
      content: `Buffer cleared. Calibration parameters for **${activeBrand.brand_name}** locked. Ready for input.`,
      image_url: null,
      asset_id: null,
      metadata: null,
      created_at: new Date().toISOString(),
    };
    setMessages([welcomeMsg]);

    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.from("messages").delete().eq("session_id", activeConversationId);
      } catch (e) {
        console.warn("Failed to clear messages in Supabase:", e);
      }
    }

    saveMessage(welcomeMsg).catch(console.warn);
  };

  const handleNewConversation = async () => {
    if (!activeBrand) return;
    const targetTenantId = activeBrand.tenant_id || tenantId || generateUUID();
    const newId = generateUUID();
    const newConv: Conversation = {
      id: newId,
      tenant_id: targetTenantId,
      brand_profile_id: activeBrand.id,
      title: `Buffer #${conversations.length + 1}`,
      format_preset: selectedPreset,
      aspect_ratio: "1:1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);

    const welcomeMsg: Message = {
      id: generateUUID(),
      conversation_id: newId,
      tenant_id: targetTenantId,
      brand_profile_id: activeBrand.id,
      role: "assistant",
      content: `Allocated buffer for **${activeBrand.brand_name}**. Select format preset or direct specification.`,
      image_url: null,
      asset_id: null,
      metadata: null,
      created_at: new Date().toISOString(),
    };

    setMessages([welcomeMsg]);

    try {
      await saveChatSession(newConv);
      await saveMessage(welcomeMsg);
    } catch (e) {
      console.warn("Failed to persist new conversation/message:", e);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      await deleteChatSession(convId);
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);

      if (activeConversationId === convId) {
        if (remaining.length > 0) {
          const nextActiveId = remaining[0].id;
          setActiveConversationId(nextActiveId);
          const nextMsgs = await getMessages(nextActiveId);
          setMessages(nextMsgs);
        } else {
          handleNewConversation();
        }
      }
    } catch (e) {
      console.warn("Failed to delete conversation:", e);
    }
  };

  const handleDeleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const currentConvTitle = conversations.find((c) => c.id === activeConversationId)?.title || "STANDBY BUFFER";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c0e12] text-[#eef1f7]">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        brands={brands}
        activeBrand={activeBrand}
        onSelectBrand={handleSelectBrand}
        onAddNewBrand={handleAddNewBrand}
        usageCount={usageCount}
        usageLimit={usageLimit}
        canvaConnected={canvaConnected}
        onOpenUpgrade={() => setShowUpgradeModal(true)}
        conversations={activeBrand ? conversations.filter((c) => c.brand_profile_id === activeBrand.id) : []}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0c0e12] relative">
        {/* TOP HARDWARE RAIL (Header) */}
        <header className="h-12 border-b border-[#232936] px-4 flex items-center justify-between shrink-0 bg-[#0c0e12]/95 backdrop-blur-md z-30 shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-[0.25em] text-[#eef1f7] font-semibold uppercase select-none">
                EIDETIC
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.9)]" />
            </div>

            <div className="h-3 w-[1px] bg-[#232936] mx-1" />

            {/* Spec Pill */}
            {activeBrand ? (
              <div className="flex items-center gap-1.5 bg-[#111317] border border-[#232936] rounded-[2px] px-2 py-0.5">
                <span className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider">
                  SPEC:
                </span>
                <span className="font-mono text-[10px] text-[#eef1f7] font-medium tracking-tight">
                  {activeBrand.brand_name.toUpperCase()}
                </span>
                <div className="flex items-center gap-1 ml-1">
                  <div
                    className="w-2 h-2 rounded-[1px] border border-black/40"
                    style={{ backgroundColor: activeBrand.primary_colour }}
                  />
                  {activeBrand.secondary_colours?.[0] && (
                    <div
                      className="w-2 h-2 rounded-[1px] border border-black/40"
                      style={{ backgroundColor: activeBrand.secondary_colours[0] }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <span className="font-mono text-[10px] text-[#8f9194]">
                [ NO SPEC LOADED ]
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Canva Link Action */}
            <button
              id="canva-status-header-btn"
              type="button"
              onClick={() => setShowCanvaModal(true)}
              className="h-7 px-2.5 flex items-center gap-1.5 bg-[#16181d] border border-[#232936] hover:border-[#333842] rounded-[2px] text-[#8f9194] hover:text-[#eef1f7] transition-all font-mono text-[9px] uppercase tracking-wider active:translate-y-[1px]"
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>CANVA</span>
              <span className="text-[8px] px-1 py-0.2 rounded-[1px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
                LINK
              </span>
            </button>

            {/* Prompt DNA Inspector */}
            <button
              type="button"
              disabled={!activeBrand}
              onClick={() => setShowSystemPromptModal(true)}
              className="h-7 px-2.5 flex items-center gap-1.5 bg-[#16181d] border border-[#232936] hover:border-[#333842] disabled:opacity-40 rounded-[2px] text-[#8f9194] hover:text-[#eef1f7] transition-all font-mono text-[9px] uppercase tracking-wider active:translate-y-[1px]"
              title="Inspect 5-layer prompt DNA"
            >
              <Code2 className="w-3 h-3 text-[#4edea3]" />
              <span className="hidden sm:inline">PROMPT MATRIX</span>
            </button>

            {/* Reset Buffer */}
            {currentTab === "chat" && activeBrand && (
              <button
                type="button"
                onClick={handleResetConversation}
                className="h-7 px-2 bg-[#16181d] border border-[#232936] hover:border-[#333842] rounded-[2px] text-[#8f9194] hover:text-[#eef1f7] transition-all active:translate-y-[1px]"
                title="Reset buffer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Tab Views */}
        {isLoadingData ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-8 h-8 rounded-[2px] bg-[#16181d] border border-[#333842] flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4 text-[#4edea3] animate-spin" />
            </div>
            <p className="font-mono text-xs text-[#8f9194] tracking-wider uppercase">
              CALIBRATING PRECISION WORKSPACE...
            </p>
          </div>
        ) : currentTab === "chat" ? (
          !activeBrand ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto relative z-10">
              <div className="w-14 h-14 rounded-lg bg-[#111317] border border-[#232936] flex items-center justify-center mb-5 shadow-2xl">
                <Sliders className="w-6 h-6 text-[#4edea3]" />
              </div>
              <h2 className="font-mono text-sm uppercase tracking-widest text-[#eef1f7] mb-2 font-semibold">
                SYSTEM UNCALIBRATED
              </h2>
              <p className="font-mono text-[11px] text-[#8f9194] mb-6 leading-relaxed">
                No active brand profile loaded. Initialize your brand DNA matrix (colors, typography, logo anchors) to begin high-precision visual generation.
              </p>
              <button
                type="button"
                onClick={() => setShowOnboardingModal(true)}
                className="h-9 px-5 rounded-[2px] bg-[#eef1f7] hover:bg-white text-[#0c0e12] font-mono text-xs tracking-wider uppercase font-semibold flex items-center gap-2 border border-white/20 shadow-md active:translate-y-[1px] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                CALIBRATE BRAND SPEC
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              {/* TOP TELEMETRY STRIP */}
              <section className="w-full h-7 bg-[#111317]/90 backdrop-blur-sm border-b border-[#232936] flex items-center justify-between px-4 text-[#8f9194] z-20 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.8)]" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#eef1f7] font-semibold">
                      CALIBRATED WORKSPACE
                    </span>
                  </div>
                  <div className="h-3 w-[1px] bg-[#232936]" />
                  <span className="hidden sm:inline font-mono text-[9px] text-[#8f9194] tracking-wider">
                    BUFFER: <span className="text-[#eef1f7]">{currentConvTitle}</span>
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[9px] text-[#8f9194]">
                  <span className="tracking-wider">CANVAS: <span className="text-[#eef1f7]">4096 × 4096 PX</span></span>
                  <span className="hidden md:inline tracking-wider">LATENCY: <span className="text-[#4edea3]">14ms</span></span>
                </div>
              </section>

              {/* CENTER STAGE (Infinite Focus Canvas & Messages Viewport) */}
              <div className="relative flex-1 w-full overflow-y-auto p-4 md:p-8 pb-36 optical-grid-fine" id="chat-thread">
                {/* Registration Grid Corner Crosshairs */}
                <div className="absolute top-4 left-4 reg-mark">
                  <p>┌ + REG_01 [NW]</p>
                </div>
                <div className="absolute top-4 right-4 reg-mark text-right">
                  <p>+ ┐ REG_02 [NE]</p>
                </div>

                {/* Quota limit card if reached */}
                {usageCount >= usageLimit && (
                  <div className="max-w-2xl mx-auto mb-6">
                    <LimitCard
                      currentUsage={usageCount}
                      monthlyLimit={usageLimit}
                      planName="Precision Pro Tier"
                      onUpgrade={() => setCurrentTab("settings")}
                    />
                  </div>
                )}

                {/* Messages / Renders List */}
                <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                  {/* Empty Slate if no messages or only 1 welcome message without image */}
                  {messages.length <= 1 && !messages[0]?.image_url && (
                    <div className="relative flex flex-col items-center justify-center py-10 transition-all duration-200">
                      <div className="relative bg-[#111317] rounded-lg p-3 border border-[#232936] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.9)] max-w-lg w-full">
                        {/* Top specular wire */}
                        <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                        {/* Recessed well */}
                        <div className="relative w-full h-[320px] bg-[#0c0e12] rounded-[2px] shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] border border-black/60 flex flex-col items-center justify-center p-6 text-center">
                          {/* Tactical bounds */}
                          <div className="absolute inset-3 border border-dashed border-[#232936] rounded-[1px] pointer-events-none flex flex-col justify-between p-2">
                            <div className="flex justify-between font-mono text-[9px] text-[#8f9194]/40">
                              <span>0,0</span>
                              <span>1:1 BOUNDS [READY]</span>
                              <span>4096,0</span>
                            </div>
                            <div className="flex justify-center items-center opacity-30">
                              <Crop className="w-8 h-8 text-[#8f9194]" />
                            </div>
                            <div className="flex justify-between font-mono text-[9px] text-[#8f9194]/40">
                              <span>0,4096</span>
                              <span>STANDBY LATENT SPACE</span>
                              <span>4096,4096</span>
                            </div>
                          </div>

                          <div className="relative z-10 max-w-xs flex flex-col items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-[#1e2024] flex items-center justify-center border border-[#333842] shadow-inner">
                              <Terminal className="w-4 h-4 text-[#4edea3]" />
                            </div>
                            <p className="text-sm text-[#eef1f7] tracking-tight font-medium mt-1">
                              &ldquo;Describe a visual to craft with your brand DNA.&rdquo;
                            </p>
                            <p className="font-mono text-[10px] text-[#8f9194] leading-relaxed">
                              Calibrated against: {activeBrand.brand_name} • {activeBrand.primary_colour}
                            </p>
                          </div>
                        </div>

                        {/* Footer Readout */}
                        <div className="mt-2 px-2.5 py-1 flex items-center justify-between bg-[#0c0e12]/80 border border-[#232936] rounded-[2px] font-mono text-[9px] text-[#8f9194]">
                          <span>STATE: UNALLOCATED BUFFER</span>
                          <span className="text-[#eef1f7]">READY FOR SPECIFICATION INPUT</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rendered Messages */}
                  {messages
                    .filter(
                      (msg) =>
                        !msg.conversation_id ||
                        !activeConversationId ||
                        msg.conversation_id === activeConversationId
                    )
                    .map((msg) => {
                      const isUser = msg.role === "user";
                      const isError =
                        !isUser &&
                        (Boolean(msg.metadata?.error) ||
                          msg.content.includes("Image Generation Failed") ||
                          msg.content.includes("Failed to generate image") ||
                          msg.content.includes("Optical Synthesis Failed"));

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                        >
                          {/* Avatar Chip */}
                          <div
                            className={`w-6 h-6 rounded-[2px] flex items-center justify-center shrink-0 font-mono text-[10px] font-semibold ${
                              isUser
                                ? "bg-[#1e2024] text-[#eef1f7] border border-[#333842]"
                                : isError
                                ? "bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30"
                                : "bg-[#111317] text-[#4edea3] border border-[#232936]"
                            }`}
                          >
                            {isUser ? (
                              <User className="w-3.5 h-3.5" />
                            ) : isError ? (
                              <AlertCircle className="w-3.5 h-3.5 text-[#ffb4ab]" />
                            ) : (
                              <Bot className="w-3.5 h-3.5 text-[#4edea3]" />
                            )}
                          </div>

                          {/* Bubble Container */}
                          <div className={`max-w-[90%] ${msg.image_url ? "w-full" : ""}`}>
                            {/* Text message (only if user or error or non-image message) */}
                            {(!msg.image_url || isUser || isError) && msg.content && (
                              <div
                                className={`rounded-[2px] p-3 text-xs leading-relaxed ${
                                  isUser
                                    ? "bg-[#1e2024] border border-[#333842] text-[#eef1f7] font-mono text-[11px]"
                                    : isError
                                    ? "bg-[#ffb4ab]/5 border border-[#ffb4ab]/30 text-[#ffb4ab] font-mono text-[11px]"
                                    : "bg-[#111317] border border-[#232936] text-[#c5c6ca] font-mono text-[11px]"
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            )}

                            {/* Rendered graphic card */}
                            {msg.image_url && (
                              <GeneratedGraphicCard
                                imageUrl={msg.image_url}
                                metadata={msg.metadata}
                                canvaConnected={canvaConnected}
                                onConnectCanva={() => setShowCanvaModal(true)}
                                brandName={activeBrand.brand_name}
                                assetId={msg.asset_id}
                                tenantId={activeBrand.tenant_id}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {/* Latency Generating Indicator */}
                  {isGenerating && (
                    <div className="flex items-center gap-2.5 font-mono text-[10px] text-[#4edea3] p-3 bg-[#111317] rounded-[2px] border border-[#232936] w-fit shadow-md">
                      <div className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping" />
                      <span>SYNTHESIZING OPTICAL MATRIX // BRAND DNA: {activeBrand.brand_name.toUpperCase()}...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* DOCKED FLOATING COMMAND UNIT (Bottom Center Machined Console) */}
              <footer className="fixed bottom-5 inset-x-0 mx-auto w-[94%] max-w-[780px] z-50 pointer-events-auto">
                <div className="relative machined-plate rounded-lg p-2 bg-[#111317]/95 backdrop-blur-md">
                  {/* Top Specular Highlight Wire */}
                  <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

                  {/* Execution Progress Bar */}
                  {isGenerating && (
                    <div className="absolute -top-[2px] left-3 right-3 h-[2px] bg-[#1e2024] overflow-hidden rounded-full">
                      <div className="h-full bg-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.9)] animate-pulse w-full" />
                    </div>
                  )}

                  {/* Suggestion Chips Bar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-2 px-0.5">
                    {PROMPT_SUGGESTIONS.map((sugg, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(sugg)}
                        className="shrink-0 font-mono text-[9px] px-2 py-0.5 rounded-[1px] bg-[#0c0e12] hover:bg-[#1e2024] text-[#8f9194] hover:text-[#eef1f7] border border-[#232936] transition-colors"
                      >
                        + {sugg}
                      </button>
                    ))}
                  </div>

                  {/* PART A: Tactile Format Preset Dial / Segmented Rocker */}
                  <div className="w-full mb-2">
                    <FormatPresetsBar
                      selectedPreset={selectedPreset}
                      onSelectPreset={handleSelectPreset}
                      customRatio={customRatio}
                      setCustomRatio={setCustomRatio}
                    />
                  </div>

                  {/* PART B & C: Main Input Well + Generate Trigger */}
                  <div className="flex items-center gap-2">
                    {/* Direct Specification Input Well */}
                    <div className="relative flex-1 bg-[#0c0e12] rounded-[2px] border border-[#232936] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] flex items-center px-3 h-10 focus-within:border-[#4edea3]/60 transition-colors">
                      <span className="font-mono text-[#4edea3] text-xs mr-2.5 shrink-0 select-none font-semibold">
                        &gt;
                      </span>
                      <input
                        id="chat-prompt-input"
                        type="text"
                        value={inputPrompt}
                        onChange={(e) => setInputPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder={`Describe the visual to craft for ${activeBrand.brand_name}...`}
                        className="w-full bg-transparent border-none outline-none font-sans text-xs text-[#eef1f7] placeholder-[#8f9194] font-normal tracking-tight"
                      />
                      {inputPrompt && (
                        <button
                          type="button"
                          onClick={() => setInputPrompt("")}
                          className="text-[#8f9194] hover:text-[#eef1f7] transition-colors ml-1 p-0.5 shrink-0"
                          title="Clear buffer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Primary Instrument Trigger [GENERATE] */}
                    <button
                      id="send-prompt-btn"
                      type="button"
                      disabled={!inputPrompt.trim() || isGenerating}
                      onClick={() => handleSendMessage()}
                      className={`shrink-0 h-10 px-5 rounded-[2px] font-mono text-[10px] tracking-wider uppercase font-semibold flex items-center justify-center gap-2 border border-white/20 active:translate-y-[1px] transition-all ${
                        inputPrompt.trim() && !isGenerating
                          ? "bg-[#eef1f7] hover:bg-white text-[#0c0e12] shadow-[0_2px_6px_rgba(0,0,0,0.6)] cursor-pointer"
                          : "bg-[#1e2024] text-[#8f9194] border-[#232936] cursor-not-allowed opacity-60"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_4px_rgba(78,222,163,1)]" />
                      <span>GENERATE</span>
                      <ArrowUpRight className="w-3 h-3 font-bold" />
                    </button>
                  </div>

                  {/* Micro Status Line Under Console Bar */}
                  <div className="mt-1.5 px-1.5 flex items-center justify-between font-mono text-[8px] text-[#8f9194]">
                    <div className="flex items-center gap-2">
                      <span>PIPELINE: EIDETIC-FP16</span>
                      <span>•</span>
                      <span className={isGenerating ? "text-[#4edea3] animate-pulse" : "text-[#8f9194]"}>
                        {isGenerating ? "SYNTHESIZING // ACTIVE" : "SYSTEM IDLE // READY"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>CFG: 7.2</span>
                      <span>STEPS: 32</span>
                      <span>SEED: AUTO</span>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          )
        ) : null}

        {/* Tab Views */}
        {currentTab === "assets" && (
          <AssetGallery
            assets={assets}
            canvaConnected={canvaConnected}
            onConnectCanva={() => setShowCanvaModal(true)}
            onDeleteAsset={handleDeleteAsset}
            brandName={activeBrand?.brand_name || "Brand"}
          />
        )}

        {currentTab === "brand" && (
          activeBrand ? (
            <BrandProfileView brand={activeBrand} onUpdateBrand={handleUpdateBrand} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-[2px] bg-[#111317] border border-[#232936] flex items-center justify-center mb-4">
                <Sliders className="w-6 h-6 text-[#4edea3]" />
              </div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#eef1f7] mb-2 font-semibold">
                NO BRAND SPECIFICATION CONFIGURED
              </h2>
              <p className="font-mono text-[11px] text-[#8f9194] mb-6 leading-relaxed">
                Configure your brand DNA (palette, typography, logo anchors, and tone tags) to generate calibrated graphics.
              </p>
              <button
                type="button"
                onClick={() => setShowOnboardingModal(true)}
                className="h-8 px-4 rounded-[2px] bg-[#eef1f7] hover:bg-white text-[#0c0e12] font-mono text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                CREATE BRAND SPEC
              </button>
            </div>
          )
        )}

        {currentTab === "settings" && (
          <SettingsView
            canvaConnected={canvaConnected}
            onToggleCanva={setCanvaConnected}
            usageCount={usageCount}
            usageLimit={usageLimit}
            onOpenUpgrade={() => setShowUpgradeModal(true)}
            tenantId={activeBrand?.tenant_id || tenantId || undefined}
          />
        )}
      </main>

      {/* Canva Partner Connect Modal */}
      {showCanvaModal && (
        <div
          id="canva-connect-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="w-full max-w-md bg-[#111317] border border-[#333842] rounded-lg p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowCanvaModal(false)}
              className="absolute top-4 right-4 p-1 text-[#8f9194] hover:text-white rounded-[2px]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[2px] bg-[#1e2024] border border-[#333842] flex items-center justify-center text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-[#eef1f7] font-semibold">
                    CANVA PARTNER CONNECT
                  </h3>
                  <p className="font-mono text-[10px] text-[#8f9194]">Direct design canvas bridge</p>
                </div>
              </div>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded-[1px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                PENDING
              </span>
            </div>

            <p className="text-xs text-[#c5c6ca] leading-relaxed">
              We are finalizing our official Canva Connect Partner API integration. Once verified,
              you will be able to export any generated graphic directly into Canva with 1 click to edit layers,
              custom typography, and brand kits.
            </p>

            <div className="p-3 rounded-[2px] bg-[#0c0e12] border border-[#232936] font-mono text-[10px] space-y-1.5">
              <div className="text-[#eef1f7] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                UPCOMING PIPELINE CAPABILITIES:
              </div>
              <ul className="text-[#8f9194] space-y-1 list-disc list-inside">
                <li>Auto-sync graphic assets to your Canva Team account</li>
                <li>Launch Canva editor pre-filled with matching aspect ratio canvas</li>
                <li>Preserve prompt snapshots and brand color palettes</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCanvaModal(false)}
                className="h-8 px-4 rounded-[2px] bg-[#1e2024] hover:bg-[#282a2e] text-[#eef1f7] font-mono text-[10px] tracking-wider uppercase border border-[#333842] transition-colors"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Prompt DNA Inspector Modal */}
      {showSystemPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#111317] border border-[#333842] rounded-lg p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              type="button"
              onClick={() => setShowSystemPromptModal(false)}
              className="absolute top-4 right-4 p-1 text-[#8f9194] hover:text-white rounded-[2px]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#4edea3]" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#eef1f7] font-semibold">
                5-LAYER SYSTEM PROMPT MATRIX
              </h3>
            </div>
            <p className="font-mono text-[10px] text-[#8f9194]">
              Dynamically synthesized per brand specification to enforce strict visual identity.
            </p>

            <div className="flex-1 overflow-y-auto bg-[#0c0e12] p-4 rounded-[2px] border border-[#232936] font-mono text-[10px] text-[#4edea3]/90 leading-relaxed whitespace-pre-wrap">
              {activeBrand ? (
                buildSystemPrompt(
                  activeBrand,
                  getPresetByKey(selectedPreset),
                  { customAspectRatio: selectedPreset === "custom" ? customRatio : undefined }
                )
              ) : (
                "No active brand profile selected."
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSystemPromptModal(false)}
                className="h-8 px-4 rounded-[2px] bg-[#1e2024] hover:bg-[#282a2e] text-[#eef1f7] font-mono text-[10px] tracking-wider uppercase border border-[#333842]"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Onboarding Wizard Modal */}
      <BrandOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={handleOnboardingComplete}
        tenantId={tenantId || generateUUID()}
      />

      {/* Upgrade / Plan Selection Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        onSelectPlan={(plan) => {
          setCurrentPlan(plan);
        }}
      />
    </div>
  );
}
