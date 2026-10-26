"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import {
  ArrowLeft,
  Layers,
  Building,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setErrorMsg("Password must contain at least 6 characters.");
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
    <div className="flex flex-col w-full max-w-md relative" id="signup-form-container">
      {/* Main Authentication Card */}
      <div className="relative w-full bg-white rounded-3xl shadow-xl shadow-[#5046e5]/5 p-6 sm:p-8 border border-[#e0e2e8] overflow-hidden z-10">
        {/* Top Link */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#777587] hover:text-[#5046e5] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Identity Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5046e5] to-[#7064f5] flex items-center justify-center text-white shadow-lg shadow-[#5046e5]/25 mb-3">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[#181c20] tracking-tight">
            Create Eidetic Account
          </h1>
          <p className="text-sm text-[#464555] mt-1">
            Set up your brand workspace and start generating.
          </p>

          {isDemoMode && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2dfff]/50 text-[#5046e5] text-xs font-semibold mt-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5046e5]" />
              Sandbox Mode Active
            </div>
          )}
        </div>

        {/* Mode Segment Pill Tabs */}
        <div className="p-1 bg-[#f1f3f9] rounded-full flex items-center gap-1 mb-6">
          <Link
            href="/login"
            className="flex-1 py-2 px-4 rounded-full text-xs font-semibold text-center transition-all text-[#464555] hover:text-[#181c20]"
          >
            Sign In
          </Link>
          <button
            type="button"
            className="flex-1 py-2 px-4 rounded-full text-xs font-semibold text-center transition-all bg-[#5046e5] text-white shadow-sm"
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#e2dfff] text-[#5046e5] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-[#5046e5]" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#181c20]">
              Verification Sent
            </h3>
            <p className="text-xs text-[#464555] max-w-xs mx-auto leading-relaxed">
              Check inbox at <span className="font-semibold text-[#5046e5]">{email}</span> to verify your studio account.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#5046e5] hover:underline"
              >
                Proceed to Sign In →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold text-[#181c20] mb-1.5 ml-1"
                htmlFor="signup-brand-input"
              >
                Brand / Business Name *
              </label>
              <div className="relative flex items-center">
                <Building className="w-4 h-4 text-[#777587] absolute left-3.5 pointer-events-none" />
                <input
                  id="signup-brand-input"
                  type="text"
                  placeholder="e.g. Acme Studio"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f1f3f9] focus:bg-white text-[#181c20] text-sm rounded-full outline-none focus:ring-2 focus:ring-[#5046e5]/30 border border-transparent focus:border-[#5046e5]/30 transition-all placeholder:text-[#777587]"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-[#181c20] mb-1.5 ml-1"
                htmlFor="signup-email-input"
              >
                Email Address *
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#777587] absolute left-3.5 pointer-events-none" />
                <input
                  id="signup-email-input"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f1f3f9] focus:bg-white text-[#181c20] text-sm rounded-full outline-none focus:ring-2 focus:ring-[#5046e5]/30 border border-transparent focus:border-[#5046e5]/30 transition-all placeholder:text-[#777587]"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-[#181c20] mb-1.5 ml-1"
                htmlFor="signup-password-input"
              >
                Password (Min 6 Characters) *
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#777587] absolute left-3.5 pointer-events-none" />
                <input
                  id="signup-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-[#f1f3f9] focus:bg-white text-[#181c20] text-sm rounded-full outline-none focus:ring-2 focus:ring-[#5046e5]/30 border border-transparent focus:border-[#5046e5]/30 transition-all placeholder:text-[#777587]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#777587] hover:text-[#181c20] transition-colors focus:outline-none flex items-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="signup-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full h-11 px-6 rounded-full bg-[#5046e5] hover:bg-[#3625cd] text-white font-['Space_Grotesk'] text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-[#5046e5]/25 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? "Creating account..." : "Create Account"}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <div className="w-full h-px bg-[#e0e2e8]" />
              <span className="absolute bg-white px-3 text-xs text-[#777587]">
                or continue with
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full h-10 px-4 rounded-full bg-[#f1f3f9] hover:bg-[#eceef4] text-[#181c20] text-xs font-semibold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Google Workspace SSO</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
