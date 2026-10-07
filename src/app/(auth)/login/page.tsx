"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import { ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, Cpu } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/studio";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isDemoMode] = useState(!isSupabaseConfigured());

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    if (!isSupabaseConfigured()) {
      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setErrorMsg("Please enter your email address to receive a magic link.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    if (!isSupabaseConfigured()) {
      setTimeout(() => {
        setMagicLinkSent(true);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setMagicLinkSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured()) {
      router.push(redirectPath);
      return;
    }

    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectPath}`,
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate Google sign in.");
    }
  };

  const handleDemoBypass = () => {
    router.push(redirectPath);
  };

  return (
    <div
      className="w-full max-w-md bg-[#111317] border border-[#232936] rounded-lg p-6 shadow-2xl relative animate-fadeIn"
      id="login-form-container"
    >
      {/* Top Specular Edge */}
      <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <div className="text-center space-y-1.5 mb-6">
        <div className="w-8 h-8 rounded-[2px] bg-[#1e2024] border border-[#333842] flex items-center justify-center mx-auto mb-2 text-[#4edea3]">
          <Cpu className="w-4 h-4" />
        </div>
        <h2 className="font-mono text-sm uppercase tracking-wider text-[#eef1f7] font-semibold">
          AUTHENTICATE WORKSPACE
        </h2>
        <p className="font-mono text-[10px] text-[#8f9194]">
          Enter tenant credentials to load calibrated studio engines.
        </p>

        {isDemoMode && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[1px] bg-[#1e2024] text-[#4edea3] border border-[#333842] font-mono text-[9px] mt-1">
            <span className="w-1 h-1 rounded-full bg-[#4edea3]" />
            SANDBOX MODE ACTIVE
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 p-2.5 rounded-[1px] bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] font-mono text-[10px] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {magicLinkSent ? (
        <div className="text-center py-6 space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#1e2024] text-[#4edea3] border border-[#333842] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-mono text-xs uppercase text-[#eef1f7] font-semibold">MAGIC LINK TRANSMITTED</h3>
          <p className="font-mono text-[10px] text-[#8f9194] max-w-xs mx-auto">
            Check inbox at <span className="text-[#4edea3]">{email}</span> for authentication payload.
          </p>
          <button
            type="button"
            onClick={() => setMagicLinkSent(false)}
            className="font-mono text-[10px] text-[#8f9194] hover:text-white underline pt-2"
          >
            Authenticate with password instead
          </button>
        </div>
      ) : (
        <form onSubmit={handlePasswordLogin} className="space-y-3.5">
          <div>
            <label className="block font-mono text-[9px] font-semibold text-[#8f9194] uppercase tracking-wider mb-1">
              TENANT EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8f9194]" />
              <input
                id="login-email-input"
                type="email"
                placeholder="architect@brand.studio"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-[1px] bg-[#0c0e12] border border-[#232936] text-[#eef1f7] font-mono text-xs focus:outline-none focus:border-[#333842] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-mono text-[9px] font-semibold text-[#8f9194] uppercase tracking-wider">
                PASSPHRASE
              </label>
              <button
                type="button"
                onClick={handleMagicLink}
                className="font-mono text-[9px] text-[#4edea3] hover:underline"
              >
                REQUEST MAGIC LINK
              </button>
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8f9194]" />
              <input
                id="login-password-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-[1px] bg-[#0c0e12] border border-[#232936] text-[#eef1f7] font-mono text-xs focus:outline-none focus:border-[#333842] transition-colors"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-[1px] bg-[#eef1f7] hover:bg-white text-[#0c0e12] font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:translate-y-[1px] disabled:opacity-50"
          >
            {loading ? "AUTHENTICATING..." : "AUTHENTICATE TO STUDIO"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#232936]" />
            </div>
            <span className="relative bg-[#111317] px-2 font-mono text-[8px] text-[#8f9194] uppercase tracking-wider">
              OR FEDERATED PROVIDER
            </span>
          </div>

          <button
            id="google-oauth-btn"
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2 rounded-[1px] bg-[#1e2024] hover:bg-[#282a2e] border border-[#333842] text-[#eef1f7] font-mono text-[10px] uppercase font-semibold transition-colors flex items-center justify-center gap-2 active:translate-y-[1px]"
          >
            GOOGLE WORKSPACE SSO
          </button>

          {isDemoMode && (
            <button
              id="demo-bypass-btn"
              type="button"
              onClick={handleDemoBypass}
              className="w-full py-1.5 rounded-[1px] text-[#4edea3] hover:bg-[#1e2024] font-mono text-[9px] uppercase tracking-wider border border-[#232936] transition-colors"
            >
              CONTINUE AS DEMO ARCHITECT →
            </button>
          )}

          <div className="pt-2 text-center font-mono text-[9px] text-[#8f9194]">
            NO TENANT ALLOCATED?{" "}
            <Link href="/signup" className="text-[#4edea3] font-semibold hover:underline">
              INITIALIZE TENANT
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="font-mono text-xs text-[#8f9194]">INITIALIZING...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
