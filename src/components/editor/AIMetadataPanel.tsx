import React from "react";
import { Sparkles } from "lucide-react";

interface AIMetadataPanelProps {
  explanation: string;
}

export function AIMetadataPanel({ explanation }: AIMetadataPanelProps) {
  if (!explanation) return null;

  return (
    <div className="px-3 sm:px-6 mt-4 mb-6 max-w-[1700px] mx-auto w-full z-10 relative shrink-0">
      <div className="border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
        <div className="h-8 flex items-center px-3 sm:px-4 bg-slate-100 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-[11px] font-semibold tracking-wide">
            <Sparkles className="w-3 h-3" />
            CHANGE SUMMARY
          </div>
        </div>
        <div className="p-3 sm:p-4 text-[12px] sm:text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap font-mono max-h-[30vh] overflow-y-auto min-h-[80px]">
          {explanation}
        </div>
      </div>
    </div>
  );
}
