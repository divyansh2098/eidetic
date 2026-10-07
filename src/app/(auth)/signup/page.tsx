"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import { ArrowRight, Lock, Mail, Building, AlertCircle, CheckCircle2, Cpu } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDemoMode] = useState(!isSupabaseConfigured());

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !brandName) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Passphrase must contain at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    if (!isSupabaseConfigured()) {
      setTimeout(() => {
        router.push("/studio");
      }, 500);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            brand_name: brandName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/studio`,
        },
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize tenant account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isSupabaseConfigured()) {
      router.push("/studio");
      return;
    }

    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=/studio`,
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate Google authorization.");
    }
  };

  return (
    <div
      className="w-full max-w-md bg-[#111317] border border-[#232936] rounded-lg p-6 shadow-2xl relative animate-fadeIn"
      id="signup-form-container"
    >
      {/* Top Specular Edge */}
      <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <div className="text-center space-y-1.5 mb-6">
        <div className="w-8 h-8 rounded-[2px] bg-[#1e2024] border border-[#333842] flex items-center justify-center mx-auto mb-2 text-[#4edea3]">
          <Cpu className="w-4 h-4" />
        </div>
        <h2 className="font-mono text-sm uppercase tracking-wider text-[#eef1f7] font-semibold">
          PROVISION TENANT WORKSPACE
        </h2>
        <p className="font-mono text-[10px] text-[#8f9194]">
          Allocate dedicated cryptographic tenant for your brand specification.
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

      {success ? (
        <div className="text-center py-6 space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#1e2024] text-[#4edea3] border border-[#333842] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-mono text-xs uppercase text-[#eef1f7] font-semibold">
            VERIFICATION DISPATCHED
          </h3>
          <p className="font-mono text-[10px] text-[#8f9194] max-w-xs mx-auto">
            Check inbox at <span className="text-[#4edea3]">{email}</span> to verify and activate studio access.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="font-mono text-[10px] text-[#4edea3] hover:underline"
            >
              PROCEED TO AUTHENTICATION →
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-3.5">
          <div>
            <label className="block font-mono text-[9px] font-semibold text-[#8f9194] uppercase tracking-wider mb-1">
              BRAND / ENTITY DESIGNATION *
            </label>
            <div className="relative">
              <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8f9194]" />
              <input
                id="signup-brand-input"
                type="text"
                placeholder="e.g. Aesthete Architecture"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-[1px] bg-[#0c0e12] border border-[#232936] text-[#eef1f7] font-mono text-xs focus:outline-none focus:border-[#333842] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[9px] font-semibold text-[#8f9194] uppercase tracking-wider mb-1">
              WORK EMAIL ADDRESS *
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8f9194]" />
              <input
                id="signup-email-input"
                type="email"
                placeholder="architect@brand.studio"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-[1px] bg-[#0c0e12] border border-[#232936] text-[#eef1f7] font-mono text-xs focus:outline-none focus:border-[#333842] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[9px] font-semibold text-[#8f9194] uppercase tracking-wider mb-1">
              PASSPHRASE (MIN 6 CHARACTERS) *
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8f9194]" />
              <input
                id="signup-password-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-[1px] bg-[#0c0e12] border border-[#232936] text-[#eef1f7] font-mono text-xs focus:outline-none focus:border-[#333842] transition-colors"
              />
            </div>
          </div>

          <button
            id="signup-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-[1px] bg-[#eef1f7] hover:bg-white text-[#0c0e12] font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:translate-y-[1px] disabled:opacity-50"
          >
            {loading ? "PROVISIONING..." : "PROVISION WORKSPACE"}
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
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full py-2 rounded-[1px] bg-[#1e2024] hover:bg-[#282a2e] border border-[#333842] text-[#eef1f7] font-mono text-[10px] uppercase font-semibold transition-colors flex items-center justify-center gap-2 active:translate-y-[1px]"
          >
            GOOGLE WORKSPACE SSO
          </button>

          <div className="pt-2 text-center font-mono text-[9px] text-[#8f9194]">
            ALREADY PROVISIONED?{" "}
            <Link href="/login" className="text-[#4edea3] font-semibold hover:underline">
              AUTHENTICATE
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
