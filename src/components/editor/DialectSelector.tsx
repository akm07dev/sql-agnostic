"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select";
import { getCategorizedDialects, type SqlDialect } from "@/lib/dialects";

interface DialectSelectorProps {
  value: SqlDialect;
  onValueChange: (value: SqlDialect) => void;
  className?: string;
}

export const DialectIcon = ({ icon, className = "w-4 h-4" }: { icon: string; className?: string }) => (
  <span className="inline-flex items-center justify-center shrink-0 w-5 h-5 rounded bg-slate-100 dark:bg-zinc-800 p-0.5">
    <img src={icon} alt="" className={`${className} dark:invert opacity-80`} />
  </span>
);

export function DialectSelector({ value, onValueChange, className }: DialectSelectorProps) {
  const { popular, other } = getCategorizedDialects();
  const all = [...popular, ...other];
  const currentDialect = all.find(d => d.value === value);

  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as SqlDialect)}>
      <SelectTrigger className={`w-[210px] h-[36px] border border-slate-300 dark:border-white/10 bg-white dark:bg-zinc-900 text-sm font-semibold rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/40 ${className}`}>
        <span className="flex items-center gap-2 truncate">
          <DialectIcon icon={currentDialect?.icon ?? ""} className="w-4 h-4 shrink-0" />
          {currentDialect?.label || value}
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500">Popular</SelectLabel>
          {popular.map((d) => (
            <SelectItem key={d.value} value={d.value} className="cursor-pointer">
              <span className="flex items-center gap-2">
                <DialectIcon icon={d.icon} className="w-4 h-4" />
                {d.label}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator className="my-1 border-slate-200 dark:border-white/5" />
        <SelectGroup>
          <SelectLabel className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500">All Dialects</SelectLabel>
          {other.map((d) => (
            <SelectItem key={d.value} value={d.value} className="cursor-pointer">
              <span className="flex items-center gap-2">
                <DialectIcon icon={d.icon} className="w-4 h-4" />
                {d.label}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
