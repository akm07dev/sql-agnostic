"use client";

import { useState, useEffect } from "react";
import { Editor, DiffEditor } from "@monaco-editor/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftRight, Sparkles, ThumbsDown, ThumbsUp, Loader2, ChevronRight, Minimize2, Copy, Check, ClipboardPaste } from "lucide-react";
import { getCategorizedDialects, type SqlDialect } from "@/lib/dialects";
import { useTheme } from "next-themes";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { STORAGE_KEYS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useSql } from "@/hooks/useSql";
import { JsonLd } from "@/components/seo/JsonLd";

const DialectIcon = ({ icon, className = "w-4 h-4" }: { icon: string; className?: string }) => (
  <span className="inline-flex items-center justify-center shrink-0 w-5 h-5 rounded bg-slate-100 dark:bg-zinc-800 p-0.5">
    <Image src={icon} alt="" width={20} height={20} className={`${className} dark:invert opacity-80 object-contain`} />
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

export default function Home() {
  const [showRefinement, setShowRefinement] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [sourceCopied, setSourceCopied] = useState(false);
  const [targetCopied, setTargetCopied] = useState(false);
  const [sourcePasted, setSourcePasted] = useState(false);

  const { user, authLoading, signOut, supabase } = useAuth();
  const {
    sourceCode,
    setSourceCode,
    targetCode,
    aiRefinedCode,
    targetView,
    setTargetView,
    sourceDialect,
    setSourceDialect,
    targetDialect,
    setTargetDialect,
    isTranspiling,
    isRefining,
    aiExplanation,
    handleTranspile,
    handleRefine,
  } = useSql({ user });

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceCode(text);
        setSourcePasted(true);
        setTimeout(() => setSourcePasted(false), 2000);
      }
    } catch (err) {
      console.error("Failed to read clipboard contents", err);
    }
  };

  const { theme, systemTheme } = useTheme();
  const { popular, other } = getCategorizedDialects();

  useEffect(() => {
    const savedSource = localStorage.getItem(STORAGE_KEYS.SOURCE_DIALECT) as SqlDialect;
    const savedTarget = localStorage.getItem(STORAGE_KEYS.TARGET_DIALECT) as SqlDialect;
    if (savedSource) setSourceDialect(savedSource);
    if (savedTarget) setTargetDialect(savedTarget);
  }, [setSourceDialect, setTargetDialect]);

  const handleTranspileClick = async () => {
    await handleTranspile();
    setShowRefinement(false);
  };

  const handleRefineClick = async (nextInstructions: string) => {
    setShowRefinement(false);
    await handleRefine(nextInstructions);
    if (user) {
      setInstructions("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleFeedback = async (isPositive: boolean) => {
    if (!isPositive && user) {
      setShowRefinement(true);
    }

    // Safely fire-and-forget telemetry insertion
    supabase.from('feedback').insert({
      user_id: user?.id,
      is_positive: isPositive,
      source_code: sourceCode,
      target_code: targetCode,
      source_dialect: sourceDialect,
      target_dialect: targetDialect
    }).then(({ error }) => {
      if (error) console.error("Feedback telemetry failed:", error);
    });
  };

  const swapDialects = () => {
    const temp = sourceDialect;
    setSourceDialect(targetDialect);
    setTargetDialect(temp);
  };

  const isDark = theme === "system" ? systemTheme === "dark" : theme === "dark";

  const getDialect = (value: string) => {
    const all = [...popular, ...other];
    return all.find(d => d.value === value);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-300 font-sans relative selection:bg-indigo-200 dark:selection:bg-indigo-500/30 transition-colors duration-500">
      <JsonLd />

      {/* Background decorations - isolated in overflow-hidden container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-900/10 blur-[120px]" />
      </div>

      <Navbar user={user} authLoading={authLoading} onSignOut={handleSignOut} />

      {/* Top Routing Header Centralized below main header */}
      <div className="w-full flex justify-center items-center py-5 -mb-2 z-10 gap-3 border-b border-transparent bg-slate-50/50 dark:bg-zinc-950/80 backdrop-blur-3xl">
        <Select value={sourceDialect} onValueChange={(v: string | null) => {
          if (!v) return;
          const newSource = v as SqlDialect;
          if (newSource === targetDialect) {
            swapDialects();
          } else {
            setSourceDialect(newSource);
            localStorage.setItem(STORAGE_KEYS.SOURCE_DIALECT, newSource);
          }
        }}>
          <SelectTrigger className="w-[210px] h-[36px] border border-slate-300 dark:border-white/10 bg-white dark:bg-zinc-900 text-sm font-semibold rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/40">
            <span className="flex items-center gap-2 truncate">
              <DialectIcon icon={getDialect(sourceDialect)?.icon ?? ""} className="w-4 h-4 shrink-0" />
              {getDialect(sourceDialect)?.label || sourceDialect}
            </span>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-2xl">
            <DialectOptions popular={popular} other={other} />
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-300 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-all" onClick={swapDialects} title="Reverse Dialects">
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </Button>

        <Select value={targetDialect} onValueChange={(v: string | null) => {
          if (!v) return;
          const newTarget = v as SqlDialect;
          if (newTarget === sourceDialect) {
            swapDialects();
          } else {
            setTargetDialect(newTarget);
            localStorage.setItem(STORAGE_KEYS.TARGET_DIALECT, newTarget);
          }
        }}>
          <SelectTrigger className="w-[210px] h-[36px] border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm font-semibold rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/50">
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

      {/* Main Dual-Pane Environment */}
      <div className="flex-1 flex flex-col lg:flex-row p-6 pt-4 gap-6 relative z-10 max-w-[1700px] mx-auto w-full">

        {/* SOURCE PANE */}
        <div className="flex-1 flex flex-col min-w-0 min-h-[70vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden group">
          {/* Pane Toolbar */}
          <div className="h-12 flex items-center px-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-zinc-900/50 shrink-0 justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500" />
              <div className="text-[12px] font-bold text-slate-700 dark:text-zinc-300 tracking-wide uppercase">Input</div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                onClick={handlePaste}
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-sm transition-colors"
                title="Paste SQL"
              >
                {sourcePasted ? <Check size={13} className="text-green-500" /> : <ClipboardPaste size={13} />}
              </Button>
              <Button
                onClick={() => copyToClipboard(sourceCode, setSourceCopied)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-sm transition-colors"
                title="Copy Source SQL"
              >
                {sourceCopied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              </Button>
            </div>
          </div>
          {/* Editor Container */}
          <div className="flex-1 relative h-full bg-white dark:bg-black/20" id="source-editor-container">
            <div className="absolute top-3 right-5 z-10 opacity-30 text-[10px] font-mono text-slate-400 dark:text-zinc-500 pointer-events-none select-none tracking-widest">INPUT</div>
            <Editor
              height="100%"
              language="sql"
              theme={isDark ? "vs-dark" : "vs-light"}
              value={sourceCode}
              onChange={(value) => setSourceCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "var(--font-geist-mono), monospace",
                scrollBeyondLastLine: false,
                lineHeight: 24,
                padding: { top: 20 },
                quickSuggestions: false,
                renderLineHighlight: "all",
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                automaticLayout: true
              }}
            />
          </div>

        </div>

        {/* CENTRALIZED ACTION COLUMN */}
        <div className="flex flex-row lg:flex-col justify-center items-center gap-3 lg:gap-4 z-20 px-2 py-2 lg:px-2 lg:py-0 relative lg:-mx-2">
          <Button
            onClick={handleTranspileClick}
            disabled={isTranspiling}
            className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all duration-300 font-semibold border-4 border-slate-50 dark:border-zinc-950 flex shadow-indigo-600/30 items-center justify-center p-0"
            title="Transpile Code"
          >
            {isTranspiling ? <Loader2 className="animate-spin w-5 h-5 lg:w-6 lg:h-6" /> : <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8 ml-0.5" />}
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              className="w-9 h-9 lg:w-12 lg:h-12 rounded-full bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 p-0"
              onClick={() => {
                if (!user) return window.location.href = "/login";
                if (showRefinement) {
                  if (!isRefining) handleRefineClick(instructions);
                } else {
                  setShowRefinement(true);
                }
              }}
              onDoubleClick={() => {
                if (!user) return window.location.href = "/login";
                if (!isRefining) {
                  setInstructions("");
                  handleRefineClick("");
                }
              }}
              title="AI Refine — double click to skip instructions"
            >
              {isRefining ? <Loader2 className="animate-spin w-4 h-4 lg:w-5 lg:h-5" /> : <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />}
            </Button>

          </div>
        </div>

        {/* TARGET PANE */}
        <div className="flex-1 flex flex-col min-w-0 min-h-[70vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden relative group">
          {/* Pane Toolbar */}
          <div className="h-12 flex items-center px-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-zinc-900/50 shrink-0 justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
              <div className="text-[12px] font-bold text-slate-700 dark:text-zinc-300 tracking-wide uppercase">Output</div>
              {isTranspiling && <Loader2 className="animate-spin w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 ml-2" />}

              {aiRefinedCode && (
                <div className="flex ml-2 md:ml-4 gap-0.5 p-0.5 bg-slate-200/70 dark:bg-black/40 rounded-md border border-slate-300/50 dark:border-white/5">
                  <button onClick={() => setTargetView('sqlglot')} className={`px-2.5 py-1 text-[11px] font-semibold rounded-sm transition-all ${targetView === 'sqlglot' ? 'bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-200' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}>Transpiler</button>
                  <button onClick={() => setTargetView('ai')} className={`px-2.5 py-1 text-[11px] font-semibold rounded-sm transition-all ${targetView === 'ai' ? 'bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-200' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}>AI Refined</button>
                  <button onClick={() => setTargetView('diff')} className={`px-2.5 py-1 text-[11px] font-semibold rounded-sm transition-all ${targetView === 'diff' ? 'bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-200' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}>Diff</button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                onClick={() => {
                  if (targetView === "diff") {
                    const combined = `-- SQLGlot Output\n${targetCode}\n\n-- AI Refined Output\n${aiRefinedCode}`;
                    copyToClipboard(combined, setTargetCopied);
                  } else {
                    copyToClipboard(targetView === "ai" ? aiRefinedCode : targetCode, setTargetCopied);
                  }
                }}
                disabled={!targetCode}
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 disabled:opacity-30 rounded-sm transition-colors"
                title={targetView === "diff" ? "Copy Both Queries" : "Copy Target SQL"}
              >
                {targetCopied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              </Button>

              <div className="flex items-center bg-slate-200/50 dark:bg-white/5 rounded-md p-0.5 border border-slate-300 dark:border-white/5">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-300/50 dark:hover:bg-white/5 rounded-sm transition-colors" onClick={() => handleFeedback(true)}>
                  <ThumbsUp size={13} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-300/50 dark:hover:bg-white/5 rounded-sm transition-colors" onClick={() => handleFeedback(false)}>
                  <ThumbsDown size={13} />
                </Button>
              </div>

            </div>
          </div>

          {/* Editor Container */}
          <div className="flex-1 relative h-full bg-slate-50/50 dark:bg-black/20" id="target-editor-container">
            <div className="absolute top-3 right-5 z-10 opacity-30 text-[10px] font-mono text-slate-400 dark:text-zinc-500 pointer-events-none select-none tracking-widest">
              {targetView === "diff" ? "AI DIFF" : targetView === "ai" ? "AI OUTPUT" : "TRANSPILER OUTPUT"}
            </div>
            {targetView === "diff" ? (
              <DiffEditor
                height="100%"
                language="sql"
                theme={isDark ? "vs-dark" : "vs-light"}
                original={targetCode}
                modified={aiRefinedCode}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "var(--font-geist-mono), monospace",
                  scrollBeyondLastLine: false,
                  lineHeight: 24,
                  padding: { top: 20 },
                  renderLineHighlight: "none",
                  automaticLayout: true
                }}
              />
            ) : (
              <Editor
                height="100%"
                language="sql"
                theme={isDark ? "vs-dark" : "vs-light"}
                value={targetView === "ai" ? aiRefinedCode : targetCode}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "var(--font-geist-mono), monospace",
                  scrollBeyondLastLine: false,
                  lineHeight: 24,
                  padding: { top: 20 },
                  renderLineHighlight: "none",
                  automaticLayout: true
                }}
              />
            )}
          </div>


        </div>
      </div>

      {/* AI Explanation — Console-style Output Panel */}
      {aiExplanation && (targetView === "ai" || targetView === "diff") && (
        <div className="px-6 -mt-2 mb-10 max-w-[1700px] mx-auto w-full z-10 relative">
          <div className="border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
            <div className="h-8 flex items-center px-4 bg-slate-100 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-[11px] font-semibold tracking-wide">
                <Sparkles className="w-3 h-3" />
                CHANGE SUMMARY
              </div>
            </div>
            <div className="p-4 text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap font-mono">{aiExplanation}</div>
          </div>
        </div>
      )}

      {/* AI Refinement Popup - Shared between mobile and desktop */}
      {showRefinement && (
        <>
          {/* Desktop: positioned near the center action buttons */}
          <div className="hidden lg:block absolute left-1/2 top-[280px] -translate-x-1/2 w-[300px] border border-slate-300 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl rounded-xl z-50 animate-in slide-in-from-top-2 flex flex-col transition-colors overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Sparkles size={11} />
                <span className="text-[11px] font-semibold tracking-wide">Refinement Instructions</span>
              </div>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-white rounded-md transition-colors" onClick={() => setShowRefinement(false)}>
                <Minimize2 size={11} />
              </Button>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <div className="relative">
                <Textarea
                  placeholder="e.g. Use explicit JOINs, quote all columns..."
                  className="w-full resize-none bg-white dark:bg-black/50 border-slate-300 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-indigo-500 text-sm min-h-[60px] placeholder:text-slate-400 dark:placeholder:text-zinc-600 rounded-lg shadow-inner text-slate-800 dark:text-zinc-300 pb-5"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!isRefining) handleRefineClick(instructions);
                    }
                  }}
                  maxLength={150}
                  autoFocus
                />
                <div className="absolute bottom-1.5 right-2.5 text-[9px] font-medium text-slate-400 dark:text-zinc-600 pointer-events-none select-none">
                  {instructions.length}/150
                </div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-600 text-center">Enter to submit · double-click ✨ to skip</p>
            </div>
          </div>

          {/* Mobile: bottom sheet style */}
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowRefinement(false)}>
            <div className="w-full max-w-md mx-4 mb-4 border border-slate-300 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl rounded-xl z-50 animate-in slide-in-from-bottom-10 flex flex-col transition-colors overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Sparkles size={12} />
                  <span className="text-sm font-semibold tracking-wide">Refinement Instructions</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-white rounded-md transition-colors" onClick={() => setShowRefinement(false)}>
                  <Minimize2 size={12} />
                </Button>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="relative">
                  <Textarea
                    placeholder="e.g. Use explicit JOINs, quote all columns..."
                    className="w-full resize-none bg-white dark:bg-black/50 border-slate-300 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-indigo-500 text-sm min-h-[80px] placeholder:text-slate-400 dark:placeholder:text-zinc-600 rounded-lg shadow-inner text-slate-800 dark:text-zinc-300 pb-6"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!isRefining) handleRefineClick(instructions);
                      }
                    }}
                    maxLength={150}
                    autoFocus
                  />
                  <div className="absolute bottom-2 right-3 text-[10px] font-medium text-slate-400 dark:text-zinc-600 pointer-events-none select-none">
                    {instructions.length}/150
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (!isRefining) handleRefineClick(instructions);
                  }}
                  disabled={isRefining}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg"
                >
                  {isRefining ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Submit
                </Button>
                <p className="text-[11px] text-slate-400 dark:text-zinc-600 text-center">Enter to submit · tap backdrop to close</p>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
