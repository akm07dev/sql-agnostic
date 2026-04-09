"use client";

import React from "react";

export function Footer() {
  return (
    <footer className="h-12 shrink-0 border-t border-slate-200 dark:border-white/5 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl flex items-center justify-between px-8 z-20 text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-1.5 cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-green-400 opacity-30 dark:opacity-20"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600 dark:bg-green-500"></span>
          </span>
          Transpiler Online
        </span>
        <span className="flex items-center gap-1.5 opacity-80 cursor-default">
          Built with ❤️ by <a href="https://github.com/akm07dev" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-500 hover:underline">Ankit Megotia</a> | Powered by <a href="https://github.com/tobymao/sqlglot" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline decoration-indigo-500/30 underline-offset-2 transition-colors">SQLGlot</a> & <a href="https://groq.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 underline decoration-orange-500/30 underline-offset-2 transition-colors">Groq</a>
        </span>
      </div>
      <div className="flex items-center gap-4 text-[11px] font-semibold tracking-wider">
        <a href="https://github.com/akm07dev" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
          GITHUB
        </a>
        <a href="https://www.linkedin.com/in/akm07dev/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
          LINKEDIN
        </a>
      </div>
    </footer>
  );
}
