"use client";

import React from "react";
import { APP_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="min-h-7 shrink-0 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-zinc-950 flex flex-col sm:flex-row items-center sm:justify-between px-4 sm:px-6 py-2 sm:py-0 text-[11px] text-slate-500 dark:text-zinc-500 font-mono z-20 transition-colors gap-2 sm:gap-0">
      <div className="flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-5">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-5 text-center">
          <span className="text-[10px] sm:text-[11px] opacity-80 cursor-default">
            Built with ❤️ by <a href={APP_LINKS.GITHUB} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Ankit Megotia</a>
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">|</span>
          <span className="text-[10px] sm:text-[11px] opacity-80 cursor-default">
            Powered by <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline decoration-emerald-500/30 underline-offset-2 transition-colors">Supabase</a>, <a href="https://github.com/tobymao/sqlglot" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline decoration-blue-500/30 underline-offset-2 transition-colors">SQLGlot</a> & <a href="https://groq.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-zinc-700 dark:text-zinc-300 hover:underline decoration-zinc-500/30 underline-offset-2 transition-colors">Groq</a> on <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline decoration-zinc-500/30 underline-offset-2 transition-colors">Vercel</a>
          </span>
          <span className="hidden md:inline text-slate-300 dark:text-zinc-700">|</span>
          <span className="text-[9px] text-slate-400 dark:text-zinc-500 italic max-w-[200px] sm:max-w-none text-center">
            *Deployed on free tier (may experience issues on strict corporate networks)
          </span>
          <span className="sm:hidden text-[9px] text-slate-400 dark:text-zinc-500 italic">
            💻 Desktop recommended
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-[11px] font-semibold tracking-tight font-mono">
        <a href={APP_LINKS.GITHUB} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/github.svg" alt="" width={12} height={12} className="w-3 h-3 opacity-80 dark:invert" />
          GitHub
        </a>
        <a href={APP_LINKS.LINKEDIN} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/linkedin.svg" alt="" width={12} height={12} className="w-3 h-3 opacity-80 dark:invert" />
          LinkedIn
        </a>
      </div>
    </footer>
  );
}
