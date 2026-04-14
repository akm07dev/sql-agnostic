"use client";

import { Moon, Sun, Loader2, LogOut, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@supabase/supabase-js";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  user: User | null;
  authLoading: boolean;
  onSignOut: () => Promise<void>;
}

export function Navbar({ user, authLoading, onSignOut }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  const { theme, setTheme, systemTheme } = useTheme();
  
  // Force server state until mounted to prevent hydration errors in SelectValue
  const selectedTheme = mounted ? (theme || "system") : "system";
  const isDarkTheme = mounted && (selectedTheme === "dark" || (selectedTheme === "system" && systemTheme === "dark"));

  return (
    <header className="h-14 shrink-0 border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl flex items-center justify-between px-3 sm:px-6 z-20 relative">
      <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity duration-300 active:scale-95">
        <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center shadow-lg border border-slate-200 dark:border-white/10 overflow-hidden transition-all hover:scale-105 duration-300">
          <Image 
            src="/apple-icon.png" 
            alt="SQLAgnostic Logo" 
            width={36}
            height={36}
            className="w-full h-full object-contain p-1 sm:p-1.5" 
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm sm:text-base font-black tracking-tight text-slate-950 dark:text-gray-50 leading-tight">SQLAgnostic</span>
          <span className="text-xs sm:text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wide sm:tracking-wider mt-0.5 opacity-80 hidden sm:block">Workbench</span>
        </div>
      </Link>

      <div className="flex items-center gap-2 sm:gap-4">
        <Select 
          value={selectedTheme}
          onValueChange={(v) => { if (v) setTheme(v); }}
        >
          <SelectTrigger className="h-8 w-auto px-2 sm:px-3 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-full text-xs font-semibold shadow-sm focus:ring-1 focus:ring-blue-500/50">
            <div className="flex items-center gap-2">
              {isDarkTheme
                ? <Moon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> 
                : <Sun className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
              }
              <span className="hidden sm:inline"><SelectValue /></span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>

        <div className="h-4 w-px bg-slate-300 dark:bg-white/10 mx-0.5 sm:mx-1"></div>

        {authLoading ? (
          <Loader2 className="animate-spin w-4 h-4 text-slate-400 dark:text-zinc-600" />
        ) : user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/dashboard"}
              className="h-8 w-auto px-2 sm:px-3 gap-2 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-slate-200 font-semibold shadow-sm hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all duration-300"
              title="Dashboard"
            >
              <BarChart3 size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <div className="hidden sm:flex flex-col text-right max-w-40">
              <span className="text-xs font-medium text-slate-600 dark:text-zinc-300 truncate">{user.email}</span>
              <span className="text-xs text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Authenticated</span>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={onSignOut}
              className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-all duration-300"
              title="Sign Out"
            >
              <LogOut size={14} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/dashboard"}
              className="h-8 w-auto px-2 sm:px-3 gap-2 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-slate-200 font-semibold shadow-sm hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all duration-300"
              title="Dashboard"
            >
              <BarChart3 size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => window.location.href = "/login"}
              className="h-8 text-xs px-3 sm:px-4 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md font-semibold transition-all duration-300 shadow-sm"
            >
              <span className="hidden sm:inline">Sign In</span>
              <span className="sm:hidden">Login</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
