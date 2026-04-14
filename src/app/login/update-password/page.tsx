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
    <div className="flex flex-col min-h-screen h-full w-full bg-zinc-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-300 font-sans items-center justify-center relative selection:bg-blue-200 dark:selection:bg-blue-500/30 transition-colors">
      
      <div className="flex flex-col w-[90%] sm:max-w-md gap-2 mx-auto z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-10 px-8 sm:px-10 shadow-sm relative">

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
              className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-blue-500 rounded-md"
            />
          </div>
          <Button
            type="submit"
            formAction={updatePassword}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold transition-colors mt-2 rounded-md"
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
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    }>
      <UpdatePasswordForm />
    </Suspense>
  );
}
