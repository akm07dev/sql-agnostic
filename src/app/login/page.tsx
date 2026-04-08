"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const messageType = searchParams.get("type") || "error";
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      alert("Google SSO Failed. Please ensure Google is enabled in your Supabase Auth Providers Settings.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen h-full w-full bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-300 font-sans items-center justify-center relative selection:bg-indigo-200 dark:selection:bg-indigo-500/30 transition-colors duration-500">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-900/10 blur-[120px] pointer-events-none" />
      
      <div className="flex flex-col w-[90%] sm:max-w-md gap-2 mx-auto z-10 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl py-10 px-8 sm:px-12 shadow-2xl transition-colors relative overflow-hidden">
        
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent"></div>

        <Link
          href="/"
          className="text-sm text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300 transition-colors mb-4 flex items-center gap-1 font-medium"
        >
          ← Back to translator
        </Link>

        <div className="flex gap-2 w-full p-1 bg-slate-200 dark:bg-black/30 rounded-lg mb-6 shadow-inner">
          <button
            onClick={() => setMode("signin")}
            type="button"
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${mode === "signin" ? "bg-white dark:bg-zinc-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            type="button"
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${mode === "signup" ? "bg-white dark:bg-zinc-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"}`}
          >
            Sign Up
          </button>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm mb-4 ${
              messageType === "success"
                ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            {message}
          </div>
        )}

        <Button
          variant="outline"
          type="button"
          disabled={loading}
          onClick={handleGoogleLogin}
          className="w-full flex items-center gap-2 mb-4 h-11 border-slate-300 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-200"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="relative mb-4 mt-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 dark:bg-zinc-950 px-3 font-semibold tracking-wider text-slate-400 dark:text-zinc-500">
              Or continue with email
            </span>
          </div>
        </div>

        <form action={mode === "signin" ? signIn : signUp} className="flex flex-col w-full gap-4 text-slate-800 dark:text-zinc-300">
          <div>
            <Label htmlFor="email" className="sr-only">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
              autoComplete="email"
              className="bg-white dark:bg-black/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-indigo-500"
            />
          </div>
          <div>
            <Label htmlFor="password" className="sr-only">Password</Label>
            <Input
              id="password"
              name="password"
              placeholder="Password"
              required
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={6}
              className="bg-white dark:bg-black/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-indigo-500"
            />
          </div>

          {mode === "signin" && (
            <Link
              href="/login/reset"
              className="text-xs text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-right -mt-1 font-medium"
            >
              Forgot password?
            </Link>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white dark:text-white shadow-md font-semibold transition-all mt-2"
            disabled={loading}
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
