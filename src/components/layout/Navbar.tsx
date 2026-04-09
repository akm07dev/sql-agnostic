"use client";

import { Moon, Sun, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@supabase/supabase-js";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import Image from "next/image";

interface NavbarProps {
  user: User | null;
  authLoading: boolean;
  onSignOut: () => Promise<void>;
}

export function Navbar({ user, authLoading, onSignOut }: NavbarProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const { theme, setTheme, systemTheme } = useTheme();
  const selectedTheme = isClient ? (theme || "system") : "system";
  const isDarkTheme = selectedTheme === "dark" || (selectedTheme === "system" && systemTheme === "dark");

  return (
    <header className="h-14 shrink-0 border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl flex items-center justify-between px-6 z-20 relative">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center shadow-lg border border-slate-200 dark:border-white/10 overflow-hidden transition-all hover:scale-105 duration-300">
          <Image 
            src="/apple-icon.png" 
            alt="SQLAgnostic Logo" 
            width={36}
            height={36}
            className="w-full h-full object-contain p-1.5" 
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-black tracking-tight text-slate-950 dark:text-gray-50 leading-tight">SQLAgnostic</span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-[0.2em] mt-0.5 opacity-80">Workbench</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select 
          value={selectedTheme}
          onValueChange={(v) => { if (v) setTheme(v); }}
        >
          <SelectTrigger className="h-8 w-auto px-3 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 rounded-full text-xs font-semibold shadow-sm focus:ring-1 focus:ring-indigo-500/50">
            <div className="flex items-center gap-2">
              {isDarkTheme
                ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> 
                : <Sun className="w-3.5 h-3.5 text-yellow-500" />
              }
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>

        <div className="h-4 w-[1px] bg-slate-300 dark:bg-white/10 mx-1"></div>

        {authLoading ? (
          <Loader2 className="animate-spin w-4 h-4 text-slate-400 dark:text-zinc-600" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-300">{user.email}</span>
              <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Authenticated</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSignOut}
              className="h-8 w-8 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-full transition-all duration-300"
              title="Sign Out"
            >
              <LogOut size={14} />
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => window.location.href = "/login"}
            className="h-8 text-xs px-4 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-zinc-200 rounded-md font-semibold transition-all duration-300 shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
