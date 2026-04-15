import React from "react";
import { ArrowLeftRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getCategorizedDialects, type SqlDialect } from "@/lib/dialects";

const DialectIcon = ({ icon, className = "w-4 h-4" }: { icon: string; className?: string }) => (
  <span className="inline-flex items-center justify-center shrink-0 w-5 h-5 rounded bg-slate-100 dark:bg-zinc-800 p-0.5">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={icon} alt="" width={20} height={20} className={`${className} dark:invert opacity-80 object-contain`} />
  </span>
);

function DialectOptions({
  popular,
  other,
}: {
  popular: ReturnType<typeof getCategorizedDialects>["popular"];
  other: ReturnType<typeof getCategorizedDialects>["other"];
}) {
  return (
    <>
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
    </>
  );
}

interface EditorToolbarProps {
  sourceDialect: SqlDialect;
  targetDialect: SqlDialect;
  onSourceChange: (v: SqlDialect) => void;
  onTargetChange: (v: SqlDialect) => void;
  onSwapDialects: () => void;
}

export function EditorToolbar({
  sourceDialect,
  targetDialect,
  onSourceChange,
  onTargetChange,
  onSwapDialects
}: EditorToolbarProps) {
  const { popular, other } = getCategorizedDialects();
  
  const getDialect = (value: string) => {
    const all = [...popular, ...other];
    return all.find(d => d.value === value);
  };

  return (
    <div className="w-full flex justify-center items-center py-5 -mb-2 z-10 gap-3 border-b border-transparent bg-slate-50/50 dark:bg-zinc-950/80 backdrop-blur-3xl">
      <Select value={sourceDialect} onValueChange={(v) => { if(v) onSourceChange(v as SqlDialect); }}>
        <SelectTrigger className="w-[180px] h-[36px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/40">
          <span className="flex items-center gap-2 truncate">
            <DialectIcon icon={getDialect(sourceDialect)?.icon ?? ""} className="w-4 h-4 shrink-0" />
            {getDialect(sourceDialect)?.label || sourceDialect}
          </span>
        </SelectTrigger>
        <SelectContent className="rounded-xl shadow-2xl">
          <DialectOptions popular={popular} other={other} />
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-300 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-all" onClick={onSwapDialects} title="Reverse Dialects">
        <ArrowLeftRight className="w-3.5 h-3.5" />
      </Button>

      <Select value={targetDialect} onValueChange={(v) => { if(v) onTargetChange(v as SqlDialect); }}>
        <SelectTrigger className="w-[180px] h-[36px] border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/50">
          <span className="flex items-center gap-2 truncate">
            <DialectIcon icon={getDialect(targetDialect)?.icon ?? ""} className="w-4 h-4 shrink-0" />
            {getDialect(targetDialect)?.label || targetDialect}
          </span>
        </SelectTrigger>
        <SelectContent className="rounded-xl shadow-2xl">
          <DialectOptions popular={popular} other={other} />
        </SelectContent>
      </Select>
    </div>
  );
}
