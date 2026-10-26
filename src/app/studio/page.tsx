"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { FormatPresetsBar } from "@/components/chat/FormatPresetsBar";
import { GeneratedGraphicCard } from "@/components/chat/GeneratedGraphicCard";
import { AssetGallery } from "@/components/assets/AssetGallery";
import { BrandProfileView } from "@/components/brand/BrandProfileView";
import { SettingsView } from "@/components/settings/SettingsView";
import { BrandOnboardingModal } from "@/components/brand/BrandOnboardingModal";
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
  ArrowUpRight,
  X,
  Code2,
  Plus,
  Sparkles,
  Sliders,
  Paintbrush,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
} from "lucide-react";

const PROMPT_SUGGESTIONS = [
  "Modern product launch announcement with bold typography and brand colors",
  "Clean minimalist event poster with geometric balance and brand logo",
  "Editorial feature graphic with elegant typography",
  "Seasonal promotion banner tailored to active brand palette",
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
  const [showSystemPromptModal, setShowSystemPromptModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  const [attachedImages, setAttachedImages] = useState<
    Array<{ data: string; mimeType: string; name: string }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestionsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollSuggestionsLeft, setCanScrollSuggestionsLeft] = useState(false);
  const [canScrollSuggestionsRight, setCanScrollSuggestionsRight] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setAttachedImages((prev) => [
            ...prev,
            {
              data: result,
              mimeType: file.type || "image/png",
              name: file.name,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const checkSuggestionsScroll = () => {
    const el = suggestionsScrollRef.current;
    if (!el) return;
    setCanScrollSuggestionsLeft(el.scrollLeft > 2);
    setCanScrollSuggestionsRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    checkSuggestionsScroll();
    window.addEventListener("resize", checkSuggestionsScroll);
    return () => window.removeEventListener("resize", checkSuggestionsScroll);
  }, []);

  const handleScrollSuggestions = (direction: "left" | "right") => {
    const el = suggestionsScrollRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -220 : 220;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(checkSuggestionsScroll, 300);
  };

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
                content: `Workspace ready for **${brandToUse.brand_name}**. Enter a prompt or select a preset to generate brand-aligned graphics.`,
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
    } catch {}
  }, [brands]);

  useEffect(() => {
    try {
      localStorage.setItem("eidetic_assets", JSON.stringify(assets));
    } catch {}
  }, [assets]);

  useEffect(() => {
    if (currentTab === "chat") {
      scrollToBottom();
    }
  }, [messages, currentTab]);

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputPrompt).trim();
    if ((!promptToSend && attachedImages.length === 0) || isGenerating) return;

    if (!activeBrand) {
      setShowOnboardingModal(true);
      return;
    }

    const currentConv = conversations.find((c) => c.id === activeConversationId);
    let convId = activeConversationId;
    const targetTenantId = activeBrand.tenant_id || tenantId || generateUUID();
    const resolvedPrompt = promptToSend || "Generate graphic incorporating reference image";

    if (!currentConv) {
      convId = generateUUID();
      const newSession: Conversation = {
        id: convId,
        tenant_id: targetTenantId,
        brand_profile_id: activeBrand.id,
        title: resolvedPrompt.slice(0, 28) + (resolvedPrompt.length > 28 ? "..." : ""),
        format_preset: selectedPreset,
        aspect_ratio: selectedPreset === "custom" ? "custom" : getPresetByKey(selectedPreset).aspectRatio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setConversations((prev) => [newSession, ...prev]);
      setActiveConversationId(convId);
      saveChatSession(newSession).catch(console.warn);
    }

    const targetPreset = getPresetByKey(selectedPreset);
    const resolvedAspectRatio: AspectRatio =
      selectedPreset === "custom" ? "custom" : targetPreset.aspectRatio;

    const imagesToAttach = [...attachedImages];
    const userMessage: Message = {
      id: generateUUID(),
      conversation_id: convId,
      tenant_id: targetTenantId,
      brand_profile_id: activeBrand.id,
      role: "user",
      content: resolvedPrompt,
      image_url: null,
      asset_id: null,
      metadata: {
        format_preset: selectedPreset,
        aspect_ratio: resolvedAspectRatio,
        attachments: imagesToAttach,
      },
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setAttachedImages([]);
    setIsGenerating(true);

    saveMessage(userMessage).catch(console.warn);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandProfile: activeBrand,
          prompt: resolvedPrompt,
          userPrompt: resolvedPrompt,
          formatPreset: selectedPreset,
          customRatio: selectedPreset === "custom" ? customRatio : undefined,
          sessionId: convId,
          attachments: imagesToAttach,
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation request failed.");
      }

      const assistantMessage: Message = {
        id: generateUUID(),
        conversation_id: convId,
        tenant_id: targetTenantId,
        brand_profile_id: activeBrand.id,
        role: "assistant",
        content: data.text || "Your graphic has been generated based on your brand identity.",
        image_url: data.imageUrl,
        asset_id: data.assetId || null,
        metadata: {
          format_preset: selectedPreset,
          aspect_ratio: resolvedAspectRatio,
          prompt_sent: data.metadata?.prompt_sent || data.imagePrompt || resolvedPrompt,
          width: targetPreset.width,
          height: targetPreset.height,
        },
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      saveMessage(assistantMessage).catch(console.warn);

      if (data.imageUrl) {
        const newAsset: Asset = {
          id: data.assetId || generateUUID(),
          tenant_id: targetTenantId,
          brand_profile_id: activeBrand.id,
          message_id: assistantMessage.id,
          format_preset: selectedPreset,
          aspect_ratio: resolvedAspectRatio,
          public_url: data.imageUrl,
          storage_path: data.storagePath || "",
          format: "png",
          width: targetPreset.width,
          height: targetPreset.height,
          canva_design_id: null,
          canva_edit_url: null,
          canva_pushed_at: null,
          created_at: new Date().toISOString(),
        };
        setAssets((prev) => [newAsset, ...prev]);
        saveAsset(newAsset).catch(console.warn);
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      const errorMessage: Message = {
        id: generateUUID(),
        conversation_id: convId,
        tenant_id: targetTenantId,
        brand_profile_id: activeBrand.id,
        role: "assistant",
        content: `Generation failed: ${err.message || "An unexpected error occurred. Please try again."}`,
        image_url: null,
        asset_id: null,
        metadata: { error: err.message || "Failed" },
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      saveMessage(errorMessage).catch(console.warn);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = (preset: FormatPreset, custom?: string) => {
    setSelectedPreset(preset);
    if (custom) {
      setCustomRatio(custom);
    }
  };

  const handleSelectBrand = (brand: BrandProfile) => {
    setActiveBrand(brand);
    const brandSessions = conversations.filter((c) => c.brand_profile_id === brand.id);
    if (brandSessions.length > 0) {
      setActiveConversationId(brandSessions[0].id);
      getMessages(brandSessions[0].id).then(setMessages).catch(console.warn);
    } else {
      setActiveConversationId("");
      setMessages([]);
    }
  };

  const handleAddNewBrand = () => {
    setShowOnboardingModal(true);
  };

  const handleOnboardingComplete = async (brandData: any) => {
    const targetTenantId = brandData.tenant_id || tenantId || generateUUID();
    const newProfile: BrandProfile = {
      ...brandData,
      id: generateUUID(),
      tenant_id: targetTenantId,
    };

    setBrands((prev) => [...prev, newProfile]);
    setActiveBrand(newProfile);
    setShowOnboardingModal(false);

    try {
      await saveBrandProfile(newProfile);
    } catch (e) {
      console.warn("Failed to persist brand profile to Supabase:", e);
    }
  };

  const handleUpdateBrand = async (updated: BrandProfile) => {
    setActiveBrand(updated);
    setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    try {
      await saveBrandProfile(updated);
    } catch (e) {
      console.warn("Failed to update brand profile:", e);
    }
  };

  const handleSelectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    const conv = conversations.find((c) => c.id === convId);
    if (conv?.format_preset) {
      setSelectedPreset(conv.format_preset as FormatPreset);
    }
    if (conv?.aspect_ratio && !["1:1", "16:9", "9:16"].includes(conv.aspect_ratio)) {
      setCustomRatio(conv.aspect_ratio);
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
            ? `Workspace ready for **${activeBrand.brand_name}**. Direct your prompt below.`
            : `Workspace active. Enter a prompt below.`,
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
    if (!confirm("Are you sure you want to clear this session's history?")) return;
    const targetTenantId = activeBrand.tenant_id || tenantId || generateUUID();
    const welcomeMsg: Message = {
      id: generateUUID(),
      conversation_id: activeConversationId,
      tenant_id: targetTenantId,
      brand_profile_id: activeBrand.id,
      role: "assistant",
      content: `Session cleared for **${activeBrand.brand_name}**. Ready for input.`,
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
      title: `Graphic #${conversations.length + 1}`,
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
      content: `New session created for **${activeBrand.brand_name}**. Select a format preset or describe your graphic.`,
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

  const currentConvTitle = conversations.find((c) => c.id === activeConversationId)?.title || "Studio Canvas";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f9ff] text-[#181c20]">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        brands={brands}
        activeBrand={activeBrand}
        onSelectBrand={handleSelectBrand}
        onAddNewBrand={handleAddNewBrand}
        conversations={activeBrand ? conversations.filter((c) => c.brand_profile_id === activeBrand.id) : []}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f7f9ff] relative">
        {/* SUB-HEADER CANVAS NAVIGATION STRIP */}
        <header className="h-14 border-b border-[#e0e2e8] px-6 flex items-center justify-between shrink-0 bg-white/90 backdrop-blur-md z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="font-['Space_Grotesk'] font-bold text-base text-[#181c20] tracking-tight">
              {currentConvTitle}
            </h1>

            <span className="px-2.5 py-0.5 rounded-full bg-[#e2dfff] text-[#3422cc] font-mono text-[11px] font-semibold">
              {selectedPreset.replace("_", " ").toUpperCase()}
            </span>

            {activeBrand && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f3f9] text-[#181c20] font-mono text-[11px] border border-[#e0e2e8]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{activeBrand.brand_name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Prompt Spec */}
            <button
              type="button"
              disabled={!activeBrand}
              onClick={() => setShowSystemPromptModal(true)}
              className="h-8 px-3 flex items-center gap-1.5 bg-[#f1f3f9] hover:bg-[#e0e2e8] border border-[#e0e2e8] disabled:opacity-40 rounded-full text-[#181c20] transition-all font-['Space_Grotesk'] text-xs font-semibold cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-[#5046e5]" />
              <span className="hidden sm:inline">Prompt Spec</span>
            </button>

            {/* Reset Session */}
            {currentTab === "chat" && activeBrand && (
              <button
                type="button"
                onClick={handleResetConversation}
                className="h-8 w-8 flex items-center justify-center bg-[#f1f3f9] hover:bg-[#e0e2e8] border border-[#e0e2e8] rounded-full text-[#464555] hover:text-[#181c20] transition-all cursor-pointer"
                title="Reset session history"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Tab Views */}
        {isLoadingData ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-[#e2dfff] flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-[#5046e5] animate-spin" />
            </div>
            <p className="font-['Space_Grotesk'] font-semibold text-sm text-[#464555]">
              Loading workspace...
            </p>
          </div>
        ) : currentTab === "chat" ? (
          !activeBrand ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#e2dfff] flex items-center justify-center mb-5 shadow-sm">
                <Sliders className="w-7 h-7 text-[#5046e5]" />
              </div>
              <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#181c20] mb-2">
                Brand Profile Required
              </h2>
              <p className="text-sm text-[#464555] mb-6 leading-relaxed">
                Set up your brand colors, logo, and tone to generate on-brand graphics.
              </p>
              <button
                type="button"
                onClick={() => setShowOnboardingModal(true)}
                className="h-11 px-6 rounded-full bg-[#5046e5] hover:bg-[#4338ca] text-white font-['Space_Grotesk'] text-xs font-semibold flex items-center gap-2 shadow-[0_4px_14px_rgba(80,70,229,0.3)] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Configure Brand DNA</span>
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              {/* Scrollable Chat & Render Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-48">
                {/* Messages / Renders List */}
                <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                  {/* Clean Empty State when session has no generated graphics yet */}
                  {messages.length <= 1 && !messages[0]?.image_url && (
                    <div className="bg-white rounded-3xl p-8 border border-[#e0e2e8] shadow-sm text-center max-w-lg mx-auto my-6 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#e2dfff] flex items-center justify-center mx-auto">
                        <Paintbrush className="w-6 h-6 text-[#5046e5]" />
                      </div>
                      <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#181c20]">
                        Ready to design for {activeBrand.brand_name}
                      </h3>
                      <p className="text-xs text-[#464555] leading-relaxed max-w-sm mx-auto">
                        Enter a prompt in the box below or click any suggestion to create a graphic tailored to your brand colors and logo.
                      </p>
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
                          msg.content.includes("Failed to generate image"));

                      return (
                        <div key={msg.id} className="w-full">
                          {isUser ? (
                            <div className="flex justify-end w-full">
                              <div className="flex flex-col items-end max-w-xl group">
                                <div className="flex items-center gap-1.5 mb-1 px-1">
                                  <span className="font-['Space_Grotesk'] text-xs text-[#464555] font-medium">You</span>
                                </div>
                                <div className="bg-[#181829] text-white rounded-3xl rounded-tr-sm px-5 py-3.5 shadow-sm space-y-2.5">
                                  {msg.metadata?.attachments && msg.metadata.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-0.5">
                                      {msg.metadata.attachments.map((att: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="relative rounded-xl overflow-hidden border border-white/20 shadow-sm bg-black/30 group/att"
                                        >
                                          <img
                                            src={att.data || att.url}
                                            alt={att.name || `Reference ${idx + 1}`}
                                            className="w-16 h-16 object-cover"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {msg.content && (
                                    <p className="text-sm leading-relaxed text-slate-100 whitespace-pre-wrap">{msg.content}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3 w-full">
                              <div className="flex items-start gap-3 max-w-2xl">
                                <div className="w-8 h-8 rounded-full bg-[#5046e5] text-white flex items-center justify-center shrink-0 shadow-sm">
                                  <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-['Space_Grotesk'] font-semibold text-sm text-[#181c20]">Eidetic</span>
                                  </div>
                                  {msg.content && (
                                    <p className={`text-sm leading-relaxed ${isError ? "text-red-600 bg-red-50 p-3 rounded-2xl border border-red-200" : "text-[#464555]"}`}>
                                      {msg.content}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {msg.image_url && (
                                <div className="pl-11">
                                  <GeneratedGraphicCard
                                    imageUrl={msg.image_url}
                                    metadata={msg.metadata}
                                    brandName={activeBrand.brand_name}
                                    assetId={msg.asset_id}
                                    tenantId={activeBrand.tenant_id}
                                    onRefine={() => setInputPrompt("Refine this graphic with adjusted color balance")}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* Generating Status */}
                  {isGenerating && (
                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#e0e2e8] shadow-sm w-fit">
                      <div className="w-8 h-8 rounded-full bg-[#e2dfff] flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-[#5046e5] animate-spin" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-['Space_Grotesk'] text-xs font-semibold text-[#181c20]">Generating Graphic</div>
                        <div className="font-mono text-[10px] text-[#464555]">Applying {activeBrand.brand_name} brand DNA...</div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* DOCKED FLOATING COMMAND UNIT */}
              <footer className="fixed bottom-6 inset-x-0 mx-auto w-[94%] max-w-3xl z-50 pointer-events-auto">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-3.5 shadow-lg shadow-[#5046e5]/10 border border-[#e0e2e8] space-y-2.5">
                  {/* Suggestion Chips Bar with Scroll Buttons */}
                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => handleScrollSuggestions("left")}
                      disabled={!canScrollSuggestionsLeft}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                        canScrollSuggestionsLeft
                          ? "bg-white hover:bg-[#f1f3f9] text-[#181c20] border-[#e0e2e8] shadow-sm"
                          : "opacity-30 cursor-not-allowed bg-transparent text-[#777587] border-transparent"
                      }`}
                      title="Scroll suggestions left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <div
                      ref={suggestionsScrollRef}
                      onScroll={checkSuggestionsScroll}
                      className="flex-1 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth px-0.5"
                    >
                      {PROMPT_SUGGESTIONS.map((sugg, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendMessage(sugg)}
                          className="shrink-0 font-['Space_Grotesk'] text-xs px-3 py-1 rounded-full bg-[#f1f3f9] hover:bg-[#e2dfff] text-[#464555] hover:text-[#5046e5] transition-colors cursor-pointer border border-[#e0e2e8]"
                        >
                          + {sugg}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleScrollSuggestions("right")}
                      disabled={!canScrollSuggestionsRight}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                        canScrollSuggestionsRight
                          ? "bg-white hover:bg-[#f1f3f9] text-[#181c20] border-[#e0e2e8] shadow-sm"
                          : "opacity-30 cursor-not-allowed bg-transparent text-[#777587] border-transparent"
                      }`}
                      title="Scroll suggestions right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Format Presets Dial */}
                  <FormatPresetsBar
                    selectedPreset={selectedPreset}
                    onSelectPreset={handleSelectPreset}
                    customRatio={customRatio}
                    setCustomRatio={setCustomRatio}
                  />

                  {/* Attachment Preview Strip */}
                  {attachedImages.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {attachedImages.map((att, idx) => (
                        <div
                          key={idx}
                          className="relative shrink-0 flex items-center gap-2 bg-[#f1f3f9] border border-[#e0e2e8] rounded-xl p-1.5 pr-2.5 shadow-sm"
                        >
                          <img
                            src={att.data}
                            alt={att.name || `Attachment ${idx + 1}`}
                            className="w-7 h-7 rounded-lg object-cover"
                          />
                          <span className="font-['Space_Grotesk'] text-xs text-[#181c20] font-medium max-w-[120px] truncate">
                            {att.name || `Image ${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(idx)}
                            className="text-[#777587] hover:text-red-600 transition-colors cursor-pointer p-0.5"
                            title="Remove attachment"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input Tray & Generate Trigger */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {/* Hidden file input for reference images */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                        attachedImages.length > 0
                          ? "bg-[#e2dfff] text-[#5046e5] border-[#5046e5]/30 shadow-sm"
                          : "bg-[#f1f3f9] hover:bg-[#e2dfff] text-[#464555] hover:text-[#5046e5] border-[#e0e2e8]"
                      }`}
                      title="Attach reference image"
                    >
                      <ImagePlus className="w-5 h-5" />
                    </button>

                    <div className="relative flex-1 bg-[#f1f3f9] rounded-2xl px-4 py-2.5 flex items-center border border-[#e0e2e8] focus-within:border-[#5046e5] focus-within:bg-white transition-all">
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
                        placeholder={`Describe a graphic for ${activeBrand.brand_name}...`}
                        className="w-full bg-transparent border-none outline-none font-sans text-sm text-[#181c20] placeholder-[#777587]"
                      />
                      {inputPrompt && (
                        <button
                          type="button"
                          onClick={() => setInputPrompt("")}
                          className="text-[#777587] hover:text-[#181c20] ml-2 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      id="send-prompt-btn"
                      type="button"
                      disabled={(!inputPrompt.trim() && attachedImages.length === 0) || isGenerating}
                      onClick={() => handleSendMessage()}
                      className={`h-11 px-6 rounded-2xl font-['Space_Grotesk'] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        (inputPrompt.trim() || attachedImages.length > 0) && !isGenerating
                          ? "bg-[#5046e5] hover:bg-[#4338ca] text-white shadow-sm active:scale-95"
                          : "bg-[#e0e2e8] text-[#777587] cursor-not-allowed"
                      }`}
                    >
                      <span>Generate</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
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
            onDeleteAsset={handleDeleteAsset}
            brandName={activeBrand?.brand_name || "Brand"}
          />
        )}

        {currentTab === "brand" && (
          activeBrand ? (
            <BrandProfileView brand={activeBrand} onUpdateBrand={handleUpdateBrand} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#e2dfff] flex items-center justify-center mb-4">
                <Sliders className="w-6 h-6 text-[#5046e5]" />
              </div>
              <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#181c20] mb-2">
                No Brand Profile Configured
              </h2>
              <p className="text-xs text-[#464555] mb-6 leading-relaxed">
                Configure your brand colors, logo, and tone to generate on-brand graphics.
              </p>
              <button
                type="button"
                onClick={() => setShowOnboardingModal(true)}
                className="h-10 px-5 rounded-full bg-[#5046e5] hover:bg-[#4338ca] text-white font-['Space_Grotesk'] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Brand Profile</span>
              </button>
            </div>
          )
        )}

        {currentTab === "settings" && (
          <SettingsView
            tenantId={activeBrand?.tenant_id || tenantId || undefined}
          />
        )}
      </main>

      {/* System Prompt Spec Inspector Modal */}
      {showSystemPromptModal && (
        <div className="fixed inset-0 z-50 bg-[#181829]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 space-y-4 shadow-xl border border-[#e0e2e8] relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#5046e5]" />
                <h3 className="font-['Space_Grotesk'] text-sm font-bold text-[#181c20]">
                  System Prompt Specification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSystemPromptModal(false)}
                className="w-7 h-7 rounded-full hover:bg-[#f1f3f9] text-[#464555] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#464555]">
              The dynamic prompt structure synthesized for {activeBrand?.brand_name || "your brand"} to enforce brand consistency.
            </p>

            <div className="flex-1 overflow-y-auto bg-[#f1f3f9] p-4 rounded-2xl border border-[#e0e2e8] font-mono text-[11px] text-[#181c20] leading-relaxed whitespace-pre-wrap">
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
                className="h-9 px-5 rounded-full bg-[#f1f3f9] hover:bg-[#e0e2e8] text-[#181c20] font-['Space_Grotesk'] text-xs font-semibold border border-[#e0e2e8]"
              >
                Close
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
    </div>
  );
}
