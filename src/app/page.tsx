"use client";

import { useState, useEffect } from "react";
import { Editor, DiffEditor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftRight, Sparkles, ThumbsDown, ThumbsUp, Loader2, LogOut, Code2, ChevronRight, Minimize2, Settings2, Moon, Sun, Copy, Check, ClipboardPaste } from "lucide-react";
import { getCategorizedDialects, type SqlDialect } from "@/lib/dialects";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useTheme } from "next-themes";

export default function Home() {
  const [sourceCode, setSourceCode] = useState("-- Enter your SQL here\nSELECT * FROM users;");
  const [targetCode, setTargetCode] = useState("");
  const [aiRefinedCode, setAiRefinedCode] = useState("");
  const [targetView, setTargetView] = useState<"sqlglot" | "ai" | "diff">("sqlglot");
  const [sourceDialect, setSourceDialect] = useState<SqlDialect>("postgres");
  const [targetDialect, setTargetDialect] = useState<SqlDialect>("mysql");
  const [isTranspiling, setIsTranspiling] = useState(false);
  
  const [showRefinement, setShowRefinement] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [lastRefineKey, setLastRefineKey] = useState("");

  const [sourceCopied, setSourceCopied] = useState(false);
  const [targetCopied, setTargetCopied] = useState(false);
  const [sourcePasted, setSourcePasted] = useState(false);

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

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { theme, setTheme, systemTheme } = useTheme();
  // Protect hydration errors
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();
  const { popular, other } = getCategorizedDialects();

  useEffect(() => {
    setMounted(true);
    // Hydrate persistent user prefs safely completely exclusively on the client side
    const savedSource = localStorage.getItem("sqlagnostic_source") as SqlDialect;
    const savedTarget = localStorage.getItem("sqlagnostic_target") as SqlDialect;
    if (savedSource) setSourceDialect(savedSource);
    if (savedTarget) setTargetDialect(savedTarget);

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);


  const handleTranspile = async () => {
    if (sourceCode.length > 100000) {
      setTargetCode("-- Error: Source SQL exceeds the generous 100,000 character limit for SQLGlot parser.");
      return;
    }

    setIsTranspiling(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: sourceCode,
          source_dialect: sourceDialect,
          target_dialect: targetDialect
        })
      });

      if (res.status === 429) {
        setTargetCode(
          user
            ? "-- Rate limit exceeded (20/minute). Please wait a moment."
            : "-- Rate limit exceeded (5/minute for guests).\n-- Sign in for higher limits!"
        );
        return;
      }

      const data = await res.json();
      if (data.error) {
        setTargetCode(`-- Parsing Error:\n-- ${data.error}`);
        setAiRefinedCode("");
        setTargetView("sqlglot");
      } else {
        setTargetCode(data.transpiled_sql);
        setAiRefinedCode("");
        setTargetView("sqlglot");
        setShowRefinement(false);
      }
    } catch (err) {
      setTargetCode("-- Fetch Error");
      setAiRefinedCode("");
      setTargetView("sqlglot");
    } finally {
      setIsTranspiling(false);
    }
  };

  const handleRefine = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (sourceCode.length > 10000) {
      alert("Source SQL code exceeds the 10,000 character limit for AI context processing.");
      return;
    }

    const refineKey = `${sourceCode}|${sourceDialect}|${targetDialect}|${instructions}`;
    if (refineKey === lastRefineKey) {
      return;
    }

    setShowRefinement(false);
    setIsRefining(true);
    try {
      const apiRes = await fetch("/api/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          source_dialect: sourceDialect,
          target_dialect: targetDialect,
          sourceSql: sourceCode,
          sqlGlotOutput: targetCode,
          userInstructions: instructions,
        }),
      });

      if (!apiRes.ok) {
        let errStr = "Refinement failed";
        if (apiRes.status === 401) errStr = "Please sign in to use AI refinement";
        if (apiRes.status === 429) errStr = "AI rate limit exceeded. Please wait.";
        alert(errStr);
        return;
      }

      const res = await apiRes.json();

      if (res.success && res.sql) {
        setAiRefinedCode(res.sql);
        setAiExplanation(res.explanation || "");
        setTargetView("ai");
        setShowRefinement(false);
        setInstructions("");
        setLastRefineKey(refineKey);
      } else {
        alert("Failed to refine: " + res.error);
      }
    } catch (err) {
      alert("Refinement execution failed");
    } finally {
      setIsRefining(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleFeedback = async (isPositive: boolean) => {
    if (!isPositive && user) {
      setShowRefinement(true);
    }

    // Safely fire-and-forget telemetry insertion
    supabase.from('feedback').insert({
      user_id: user ? user.id : null,
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

  const isDark = !mounted ? true : (theme === 'system' ? systemTheme === 'dark' : theme === 'dark');

  const getDialect = (value: string) => {
    const all = [...popular, ...other];
    return all.find(d => d.value === value);
  };

  const DialectIcon = ({ icon, className = "w-4 h-4" }: { icon: string; className?: string }) => (
    <span className="inline-flex items-center justify-center shrink-0 w-5 h-5 rounded bg-slate-100 dark:bg-zinc-800 p-0.5">
      <img src={icon} alt="" className={`${className} dark:invert opacity-80`} />
    </span>
  );

  const DialectOptions = () => (
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

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-300 font-sans relative selection:bg-indigo-200 dark:selection:bg-indigo-500/30 transition-colors duration-500">

      {/* Subtle background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-900/10 blur-[120px] pointer-events-none" />

      {/* Global Toolbar Header - Premium Glassmorphism */}
      <header className="h-14 shrink-0 border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl flex items-center justify-between px-6 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-inset ring-black/10 dark:ring-white/20">
            <Code2 size={16} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold tracking-tight text-slate-950 dark:text-gray-50 leading-tight">SQLAgnostic</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-widest mt-0.5">Workbench</span>
          </div>
        </div>

          <div className="flex items-center gap-4">
            <Select value={mounted ? (theme || "system") : "system"} onValueChange={(v) => { if (v) setTheme(v); }}>
              <SelectTrigger className="h-8 w-auto px-3 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 rounded-full text-xs font-semibold shadow-sm focus:ring-1 focus:ring-indigo-500/50">
                <div className="flex items-center gap-2">
                  {mounted && (theme === 'dark' || (theme === 'system' && systemTheme === 'dark')) ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-yellow-500" />}
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
                  onClick={handleSignOut}
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

      {/* Top Routing Header Centralized below main header */}
      <div className="w-full flex justify-center items-center py-5 -mb-2 z-10 gap-3 border-b border-transparent bg-slate-50/50 dark:bg-zinc-950/80 backdrop-blur-3xl">
        <Select value={sourceDialect} onValueChange={(v: string | null) => {
          if (!v) return;
          const newSource = v as SqlDialect;
          if (newSource === targetDialect) {
            swapDialects();
          } else {
            setSourceDialect(newSource);
            localStorage.setItem("sqlagnostic_source", newSource);
          }
        }}>
          <SelectTrigger className="w-[210px] h-[36px] border border-slate-300 dark:border-white/10 bg-white dark:bg-zinc-900 text-sm font-semibold rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/40">
            <span className="flex items-center gap-2 truncate">
              <DialectIcon icon={getDialect(sourceDialect)?.icon ?? ""} className="w-4 h-4 shrink-0" />
              {getDialect(sourceDialect)?.label || sourceDialect}
            </span>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-2xl">
            <DialectOptions />
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
            localStorage.setItem("sqlagnostic_target", newTarget);
          }
        }}>
          <SelectTrigger className="w-[210px] h-[36px] border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm font-semibold rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/50">
            <span className="flex items-center gap-2 truncate">
              <DialectIcon icon={getDialect(targetDialect)?.icon ?? ""} className="w-4 h-4 shrink-0" />
              {getDialect(targetDialect)?.label || targetDialect}
            </span>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-2xl">
            <DialectOptions />
          </SelectContent>
        </Select>
      </div>

      {/* Main Dual-Pane Environment */}
      <div className="flex-1 flex flex-col lg:flex-row p-6 pt-4 gap-6 relative z-10 max-w-[1700px] mx-auto w-full">

        {/* SOURCE PANE */}
        <div className="flex-1 flex flex-col min-w-0 h-[70vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden group">
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
          <div className="flex-1 relative bg-white dark:bg-black/20">
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
                cursorSmoothCaretAnimation: "on"
              }}
            />
          </div>
        </div>

        {/* CENTRALIZED ACTION COLUMN */}
        <div className="hidden lg:flex flex-col justify-center items-center gap-4 z-20 px-2 relative -mx-2">
          <Button
            onClick={handleTranspile}
            disabled={isTranspiling}
            className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all duration-300 font-semibold border-4 border-slate-50 dark:border-zinc-950 flex shadow-indigo-600/30 items-center justify-center p-0"
            title="Transpile Code"
          >
            {isTranspiling ? <Loader2 className="animate-spin w-6 h-6" /> : <ChevronRight className="w-8 h-8 ml-0.5" />}
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 p-0"
              onClick={() => {
                if (!user) return window.location.href = "/login";
                if (showRefinement) {
                  if (!isRefining) handleRefine();
                } else {
                  setShowRefinement(true);
                }
              }}
              onDoubleClick={() => {
                if (!user) return window.location.href = "/login";
                if (!isRefining) {
                  setInstructions("");
                  handleRefine();
                }
              }}
              title="AI Refine — double click to skip instructions"
            >
              {isRefining ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </Button>

            {/* AI Refinement Popup */}
            {showRefinement && (
              <div className="absolute left-1/2 -translate-x-1/2 top-16 w-[300px] border border-slate-300 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl rounded-xl z-50 animate-in slide-in-from-top-2 flex flex-col transition-colors overflow-hidden">
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
                          if (!isRefining) handleRefine();
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

        {/* TARGET PANE */}
        <div className="flex-1 flex flex-col min-w-0 h-[70vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden relative group">
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
          <div className="flex-1 relative bg-slate-50/50 dark:bg-black/20">
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
                }}
              />
            )}
          </div>


        </div>
      </div>

      {/* AI Explanation — Console-style Output Panel */}
      {aiExplanation && (targetView === "ai" || targetView === "diff") && (
        <div className="px-6 -mt-2 mb-4 max-w-[1700px] mx-auto w-full z-10 relative">
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

      {/* Footer / Status Bar Area */}
      <footer className="h-7 shrink-0 sticky bottom-0 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-zinc-950 flex items-center px-6 justify-between text-[11px] text-slate-500 dark:text-zinc-500 font-mono z-20 transition-colors">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2 group cursor-pointer hover:text-slate-700 dark:hover:text-zinc-300 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-green-400 opacity-30 dark:opacity-20"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600 dark:bg-green-500"></span>
            </span>
            Transpiler Online
          </span>
          <span className="flex items-center gap-1.5 opacity-80 cursor-default">
            Powered by <a href="https://github.com/tobymao/sqlglot" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline decoration-indigo-500/30 underline-offset-2 transition-colors">SQLGlot</a> & <a href="https://groq.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 underline decoration-orange-500/30 underline-offset-2 transition-colors">Groq</a>
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold tracking-wider">
          <a href="https://github.com/ankit-mego" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            GITHUB
          </a>
          <a href="https://www.linkedin.com/in/ankitkm07/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            LINKEDIN
          </a>
        </div>
      </footer>
    </div>
  );
}
