"use client";

import React from "react";
import Image from "next/image";
import { APP_LINKS } from "@/lib/constants";

const SIMPLE_ICON = (slug: string) => `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;

export function Footer() {
  return (
    <footer className="h-7 shrink-0 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-zinc-950 flex items-center px-6 justify-between text-[11px] text-slate-500 dark:text-zinc-500 font-mono z-20 transition-colors">
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-2 cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-green-400 opacity-30 dark:opacity-20"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600 dark:bg-green-500"></span>
          </span>
          Transpiler Online
        </span>
        <span className="flex items-center gap-1.5 opacity-80 cursor-default">
          Built with ❤️ by <a href={APP_LINKS.GITHUB} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-500 hover:underline">Ankit Megotia</a> | Powered by <a href="https://github.com/tobymao/sqlglot" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline decoration-indigo-500/30 underline-offset-2 transition-colors">SQLGlot</a> & <a href="https://groq.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 underline decoration-orange-500/30 underline-offset-2 transition-colors">Groq</a>
        </span>
      </div>
      <div className="flex items-center gap-4 text-[11px] font-semibold tracking-tight font-mono">
        <a href={APP_LINKS.GITHUB} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
          <Image
            src={SIMPLE_ICON("github")}
            alt="GitHub"
            width={12}
            height={12}
            className="opacity-80 dark:invert"
          />
          GitHub
        </a>
        <a href={APP_LINKS.LINKEDIN} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
          <Image
            src={SIMPLE_ICON("linkedin")}
            alt="LinkedIn"
            width={12}
            height={12}
            className="opacity-80 dark:invert"
          />
          LinkedIn
        </a>
      </div>
    </footer>
  );
}
