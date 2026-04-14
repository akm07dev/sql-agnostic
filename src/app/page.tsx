"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftRight, Sparkles, ThumbsDown, ThumbsUp, Loader2, ChevronRight, Minimize2, Copy, Check, ClipboardPaste, Lock } from "lucide-react";
import { dbService } from "@/services/dbService";
import { type SqlDialect } from "@/lib/dialects";
import { useTheme } from "next-themes";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { STORAGE_KEYS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useSql } from "@/hooks/useSql";
import { useIsMobile } from "@/hooks/useIsMobile";
import { AdaptiveEditor } from "@/components/editor/AdaptiveEditor";
import { DiffEditor } from "@monaco-editor/react";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { AIMetadataPanel } from "@/components/editor/AIMetadataPanel";
import { JsonLd } from "@/components/seo/JsonLd";



export default function Home() {
  const [showRefinement, setShowRefinement] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [sourceCopied, setSourceCopied] = useState(false);
  const [targetCopied, setTargetCopied] = useState(false);
  const [sourcePasted, setSourcePasted] = useState(false);
  const [transpiledOnce, setTranspiledOnce] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [lastSuccessfulSourceDialect, setLastSuccessfulSourceDialect] = useState<SqlDialect | null>(null);
  const [lastSuccessfulTargetDialect, setLastSuccessfulTargetDialect] = useState<SqlDialect | null>(null);
  const [currentRating, setCurrentRating] = useState<1 | -1 | null>(null);

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
    currentTranslationId,
    updateTranslation,
    resetTranslation,
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
        setTranspiledOnce(false);
        setCurrentRating(null);
        setSourcePasted(true);
        setTimeout(() => setSourcePasted(false), 2000);
      }
    } catch (err) {
      console.error("Failed to read clipboard contents", err);
    }
  };

  const { theme, systemTheme } = useTheme();
  const isMobile = useIsMobile();
  const effectiveTargetView = isMobile && targetView === "diff" ? "ai" : targetView;
  const showSummary = !!aiExplanation;

  useEffect(() => {
    const savedSource = localStorage.getItem(STORAGE_KEYS.SOURCE_DIALECT) as SqlDialect;
    const savedTarget = localStorage.getItem(STORAGE_KEYS.TARGET_DIALECT) as SqlDialect;
    if (savedSource) setSourceDialect(savedSource);
    if (savedTarget) setTargetDialect(savedTarget);
  }, [setSourceDialect, setTargetDialect]);

  useEffect(() => {
    if (cooldownTime <= 0) return;
    const timer = setTimeout(() => setCooldownTime(cooldownTime - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldownTime]);

  const handleTranspileClick = async () => {
    await handleTranspile();
    setShowRefinement(false);
    setTranspiledOnce(true);
    setLastSuccessfulSourceDialect(sourceDialect);
    setLastSuccessfulTargetDialect(targetDialect);
    setCooldownTime(2);
  };

  const handleSourceCodeChange = (newCode: string) => {
    setSourceCode(newCode);
    setTranspiledOnce(false);
    setCurrentRating(null);
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
    if (!currentTranslationId) return; // Can't rate without a translation

    // Only auto-trigger AI refinement if:
    // 1. User is logged in
    // 2. This is negative feedback (thumbs down)
    // 3. AI refinement hasn't been used yet for this translation
    if (!isPositive && user && !aiRefinedCode) {
      setShowRefinement(true);
    }

    const rating = isPositive ? 1 : -1;
    setCurrentRating(rating); // Show visual feedback immediately

    // Update rating in translations table
    await updateTranslation(currentTranslationId, { rating });
    
    // Store feedback via dbService
    await dbService.saveFeedback(currentTranslationId, isPositive);
  };

  const swapDialects = () => {
    const temp = sourceDialect;
    setSourceDialect(targetDialect);
    setTargetDialect(temp);
    setCurrentRating(null);
    // Keep unlock if swapped dialects match last successful dialects
    const shouldKeepUnlock = targetDialect === lastSuccessfulSourceDialect && sourceDialect === lastSuccessfulTargetDialect;
    if (shouldKeepUnlock) {
      setTranspiledOnce(true);
    } else {
      setTranspiledOnce(false);
    }
  };

  const handleSourceDialectChange = (newSource: SqlDialect) => {
    if (newSource === targetDialect) {
      swapDialects();
    } else {
      setSourceDialect(newSource);
      localStorage.setItem(STORAGE_KEYS.SOURCE_DIALECT, newSource);
      const shouldKeepUnlock = newSource === lastSuccessfulSourceDialect && targetDialect === lastSuccessfulTargetDialect;
      setTranspiledOnce(shouldKeepUnlock);
      setCurrentRating(null);
    }
  };

  const handleTargetDialectChange = (newTarget: SqlDialect) => {
    if (newTarget === sourceDialect) {
      swapDialects();
    } else {
      setTargetDialect(newTarget);
      localStorage.setItem(STORAGE_KEYS.TARGET_DIALECT, newTarget);
      const shouldKeepUnlock = newTarget === lastSuccessfulTargetDialect && sourceDialect === lastSuccessfulSourceDialect;
      setTranspiledOnce(shouldKeepUnlock);
      setCurrentRating(null);
    }
  };

  const isDark = theme === "system" ? systemTheme === "dark" : theme === "dark";

  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-300 font-sans relative selection:bg-blue-200 dark:selection:bg-blue-500/30 transition-colors duration-500 overflow-x-hidden">
      <JsonLd />

      <Navbar user={user} authLoading={authLoading} onSignOut={handleSignOut} />

      {/* Top Routing Header Centralized below main header */}
      <EditorToolbar 
        sourceDialect={sourceDialect}
        targetDialect={targetDialect}
        onSourceChange={handleSourceDialectChange}
        onTargetChange={handleTargetDialectChange}
        onSwapDialects={swapDialects}
      />

      {/* Main Dual-Pane Environment */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 pt-2 sm:pt-4 gap-4 sm:gap-6 relative z-10 max-w-[1700px] mx-auto w-full min-h-0">

        {/* SOURCE PANE */}
        <div className="flex-1 flex flex-col min-w-0 h-[60vh] min-h-[50vh] sm:h-[70vh] lg:h-auto lg:min-h-[70vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden group shrink-0 lg:shrink">
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
          <div className="flex-1 relative min-h-0 bg-white dark:bg-black/20">
            <div className="absolute top-3 right-5 z-10 opacity-30 text-[10px] font-mono text-slate-400 dark:text-zinc-500 pointer-events-none select-none tracking-widest">INPUT</div>
            <AdaptiveEditor 
              value={sourceCode} 
              onChange={handleSourceCodeChange} 
              isDark={isDark} 
            />
          </div>

        </div>

        {/* CENTRALIZED ACTION COLUMN */}
        <div className="flex flex-row lg:flex-col justify-center items-center gap-4 lg:gap-4 z-20 px-4 py-3 lg:px-2 lg:py-0 relative lg:-mx-2">
          <Button
            onClick={handleTranspileClick}
            disabled={isTranspiling}
            className="w-14 h-14 lg:w-14 lg:h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all duration-300 font-semibold border-4 border-zinc-50 dark:border-zinc-950 flex items-center justify-center p-0"
            title="Transpile Code"
          >
            {isTranspiling ? <Loader2 className="animate-spin w-6 h-6 lg:w-6 lg:h-6" /> : <ChevronRight className="w-8 h-8 lg:w-8 lg:h-8 ml-0.5" />}
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              disabled={!transpiledOnce || cooldownTime > 0}
              className={`w-12 h-12 lg:w-12 lg:h-12 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300 p-0 disabled:opacity-60 disabled:hover:bg-white dark:disabled:hover:bg-zinc-900 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed`}
              onClick={() => {
                if (!transpiledOnce || cooldownTime > 0) return;
                if (!user) return window.location.href = "/login";
                if (showRefinement) {
                  if (!isRefining) handleRefineClick(instructions);
                } else {
                  setShowRefinement(true);
                }
              }}
              onDoubleClick={() => {
                if (!transpiledOnce || cooldownTime > 0) return;
                if (!user) return window.location.href = "/login";
                if (!isRefining) {
                  setInstructions("");
                  handleRefineClick("");
                }
              }}
              title={!transpiledOnce ? "Run SQL transpilation first" : cooldownTime > 0 ? "Review output..." : "AI Refine — double click to skip instructions"}
            >
              {isRefining ? (
                <Loader2 className="animate-spin w-5 h-5 lg:w-5 lg:h-5" />
              ) : !transpiledOnce ? (
                <Lock className="w-5 h-5 lg:w-5 lg:h-5" />
              ) : cooldownTime > 0 ? (
                <Lock className="w-5 h-5 lg:w-5 lg:h-5 animate-unlock-lock" />
              ) : (
                <Sparkles className="w-5 h-5 lg:w-5 lg:h-5" />
              )}
            </Button>

            {/* AI Refinement Popup - Desktop only, positioned below button */}
            {showRefinement && transpiledOnce && cooldownTime <= 0 && (
              <div className="hidden lg:block absolute left-1/2 top-full mt-3 -translate-x-1/2 w-[300px] max-w-[90vw] max-h-[80vh] border border-slate-300 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl rounded-xl z-50 animate-in slide-in-from-top-2 flex flex-col transition-colors overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
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
                      className="w-full resize-none bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-blue-500 text-sm min-h-[60px] placeholder:text-slate-400 dark:placeholder:text-zinc-600 rounded-lg shadow-inner text-slate-800 dark:text-zinc-300 pb-5"
                      value={instructions}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
            )}
          </div>
        </div>

        {/* AI Refinement Popup - Mobile only, fixed position */}
        {showRefinement && transpiledOnce && cooldownTime <= 0 && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4" onClick={() => setShowRefinement(false)}>
            <div className="w-[92vw] sm:w-[80vw] max-w-sm border border-slate-300 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl rounded-xl z-50 animate-in zoom-in-95 flex flex-col transition-colors overflow-hidden max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Sparkles size={12} />
                  <span className="text-sm font-semibold tracking-wide">Refinement Instructions</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-white rounded-md transition-colors" onClick={() => setShowRefinement(false)}>
                  <Minimize2 size={12} />
                </Button>
              </div>
              <div className="p-4 flex flex-col gap-3 overflow-hidden">
                <div className="relative flex-1 min-h-0">
                  <Textarea
                    placeholder="e.g. Use explicit JOINs, quote all columns..."
                    className="w-full h-full min-h-[120px] max-h-[40vh] resize-none bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-blue-500 text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-600 rounded-lg shadow-inner text-slate-800 dark:text-zinc-300 pb-6"
                    value={instructions}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shrink-0"
                >
                  {isRefining ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Submit
                </Button>
                <p className="text-[11px] text-slate-400 dark:text-zinc-600 text-center shrink-0">Enter to submit · tap backdrop to close</p>
              </div>
            </div>
          </div>
        )}

        {/* TARGET PANE */}
        <div className="flex-1 flex flex-col min-w-0 h-[60vh] min-h-[50vh] sm:h-[70vh] lg:h-auto lg:min-h-[70vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden relative group shrink-0 lg:shrink">
          {/* Pane Toolbar */}
          <div className="h-12 flex items-center px-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-zinc-900/50 shrink-0 justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
              <div className="text-[12px] font-bold text-slate-700 dark:text-zinc-300 tracking-wide uppercase">Output</div>
              {isTranspiling && <Loader2 className="animate-spin w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 ml-2" />}

              {aiRefinedCode && (
                <div className="flex ml-2 md:ml-4 gap-0.5 p-0.5 bg-slate-200/70 dark:bg-black/40 rounded-md border border-slate-300/50 dark:border-white/5">
                  <button onClick={() => setTargetView('sqlglot')} className={`px-2.5 py-1 text-[11px] font-semibold rounded-sm transition-all ${targetView === 'sqlglot' ? 'bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-200' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}>Transpiler</button>
                  <button onClick={() => setTargetView('ai')} className={`px-2.5 py-1 text-[11px] font-semibold rounded-sm transition-all ${targetView === 'ai' ? 'bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-200' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}>AI Refined</button>
                  {!isMobile && (
                    <button onClick={() => setTargetView('diff')} className={`px-2.5 py-1 text-[11px] font-semibold rounded-sm transition-all ${targetView === 'diff' ? 'bg-white dark:bg-zinc-800 shadow-sm text-slate-800 dark:text-zinc-200' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}>Diff</button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                onClick={() => {
                  if (effectiveTargetView === "diff") {
                    const combined = `-- SQLGlot Output\n${targetCode}\n\n-- AI Refined Output\n${aiRefinedCode}`;
                    copyToClipboard(combined, setTargetCopied);
                  } else {
                    copyToClipboard(effectiveTargetView === "ai" ? aiRefinedCode : targetCode, setTargetCopied);
                  }
                }}
                disabled={!targetCode}
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 disabled:opacity-30 rounded-sm transition-colors"
                title={effectiveTargetView === "diff" ? "Copy Both Queries" : "Copy Target SQL"}
              >
                {targetCopied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              </Button>

              <div className="flex items-center bg-slate-200/50 dark:bg-white/5 rounded-md p-0.5 border border-slate-300 dark:border-white/5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={!currentTranslationId}
                  className={`h-7 w-7 rounded-sm transition-all ${
                    currentRating === 1
                      ? "text-green-600 dark:text-green-400 bg-green-100/30 dark:bg-green-500/10"
                      : "text-slate-500 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-300/50 dark:hover:bg-white/5 disabled:opacity-30"
                  }`}
                  onClick={() => handleFeedback(true)}
                  title="Good translation (SQLGlot output quality)"
                >
                  <ThumbsUp size={13} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={!currentTranslationId}
                  className={`h-7 w-7 rounded-sm transition-all ${
                    currentRating === -1
                      ? "text-red-600 dark:text-red-400 bg-red-100/30 dark:bg-red-500/10"
                      : "text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-300/50 dark:hover:bg-white/5 disabled:opacity-30"
                  }`}
                  onClick={() => handleFeedback(false)}
                  title="Poor translation (SQLGlot output quality)"
                >
                  <ThumbsDown size={13} />
                </Button>
              </div>

            </div>
          </div>

          {/* Editor Container */}
          <div className="flex-1 relative min-h-0 bg-slate-50/50 dark:bg-black/20">
            <div className="absolute top-3 right-5 z-10 opacity-30 text-[10px] font-mono text-slate-400 dark:text-zinc-500 pointer-events-none select-none tracking-widest">
              {effectiveTargetView === "diff" ? "AI DIFF" : effectiveTargetView === "ai" ? "AI OUTPUT" : "TRANSPILER OUTPUT"}
            </div>
            {effectiveTargetView === "diff" ? (
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
                  automaticLayout: true,
                  lineNumbers: isMobile ? "off" : "on",
                  contextmenu: true,
                  wordWrap: isMobile ? "on" : "off",
                }}
              />
            ) : (
              <AdaptiveEditor
                value={effectiveTargetView === "ai" ? aiRefinedCode : targetCode}
                onChange={() => {}} // Read-only
                isDark={isDark}
                readOnly={true}
              />
            )}
          </div>


        </div>
      </div>

      {/* AI Explanation — Console-style Output Panel */}
      <AIMetadataPanel explanation={showSummary ? aiExplanation : ""} />

      <Footer />
    </div>
  );
}
