"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { updatePassword } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function UpdatePasswordForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const messageType = searchParams.get("type") || "error";

  const handleSubmit = async () => {
    setLoading(true);
  };

  return (
    <div className="flex flex-col min-h-screen h-full w-full bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-300 font-sans items-center justify-center relative selection:bg-indigo-200 dark:selection:bg-indigo-500/30 transition-colors duration-500">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-900/10 blur-[120px] pointer-events-none" />
      
      <div className="flex flex-col w-[90%] sm:max-w-md gap-2 mx-auto z-10 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl py-10 px-8 sm:px-12 shadow-2xl transition-colors relative overflow-hidden">
        
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent"></div>

        <div className="flex flex-col mb-6 text-left">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Set New Password</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">
            Enter your new password below
          </p>
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

        <form className="flex flex-col w-full gap-4 text-slate-800 dark:text-zinc-300">
          <div>
            <Label htmlFor="password" className="sr-only">
              New Password
            </Label>
            <Input
              id="password"
              name="password"
              placeholder="New password"
              required
              type="password"
              autoComplete="new-password"
              minLength={6}
              className="bg-white dark:bg-black/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-indigo-500"
            />
          </div>
          <Button
            type="submit"
            formAction={updatePassword}
            className="w-full h-11 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white dark:text-white shadow-md font-semibold transition-all mt-2"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Update Password"
            )}
          </Button>
        </form>

      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-500" />
      </div>
    }>
      <UpdatePasswordForm />
    </Suspense>
  );
}
