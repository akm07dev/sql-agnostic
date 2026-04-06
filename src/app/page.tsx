"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftRight, Sparkles, ThumbsDown, ThumbsUp, Loader2, LogOut, Code2, ChevronRight, Minimize2, Settings2, Moon, Sun } from "lucide-react";
import { getCategorizedDialects, type SqlDialect } from "@/lib/dialects";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useTheme } from "next-themes";

export default function Home() {
  const [sourceCode, setSourceCode] = useState("-- Enter your SQL here\nSELECT * FROM users;");
  const [targetCode, setTargetCode] = useState("");
  const [sourceDialect, setSourceDialect] = useState<SqlDialect>("postgres");
  const [targetDialect, setTargetDialect] = useState<SqlDialect>("mysql");
  const [isTranspiling, setIsTranspiling] = useState(false);
  
  const [showRefinement, setShowRefinement] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { theme, setTheme, systemTheme } = useTheme();
  // Protect hydration errors
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();
  const { popular, other } = getCategorizedDialects();

  useEffect(() => {
    setMounted(true);
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
      } else {
        setTargetCode(data.transpiled_sql);
        setShowRefinement(false);
      }
    } catch (err) {
      setTargetCode("-- Fetch Error");
    } finally {
      setIsTranspiling(false);
    }
  };

  const handleRefine = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

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
        setTargetCode(`-- [Refined with AI]\n${res.sql}`);
        setShowRefinement(false);
        setInstructions("");
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

  const DialectOptions = () => (
    <>
      <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500">Popular</div>
      {popular.map((d) => (
        <SelectItem key={d.value} value={d.value} className="text-xs cursor-pointer focus:bg-slate-100 dark:focus:bg-white/5 transition-colors">{d.label}</SelectItem>
      ))}
      <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 mt-2 border-t border-slate-200 dark:border-white/5">All Dialects</div>
      {other.map((d) => (
        <SelectItem key={d.value} value={d.value} className="text-xs cursor-pointer focus:bg-slate-100 dark:focus:bg-white/5 transition-colors">{d.label}</SelectItem>
      ))}
    </>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-300 font-sans overflow-hidden relative selection:bg-indigo-200 dark:selection:bg-indigo-500/30 transition-colors duration-500">
      
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
            <span className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">SQLAgnostic</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium">Dialect Converter</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 rounded-md hover:bg-slate-200/50 dark:hover:bg-white/5" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
             {mounted && isDark ? <Sun className="w-4 h-4 opacity-70" /> : <Moon className="w-4 h-4 opacity-70" />}
          </Button>

          <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 rounded-md hover:bg-slate-200/50 dark:hover:bg-white/5" onClick={swapDialects}>
            <ArrowLeftRight className="w-3.5 h-3.5 mr-2 opacity-70" />
            Reverse
          </Button>
          
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

      {/* Main Dual-Pane Environment */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        
        {/* SOURCE PANE */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-white/5 min-w-0 bg-transparent">
          {/* Pane Toolbar */}
          <div className="h-11 flex items-center px-4 border-b border-slate-200 dark:border-white/5 bg-slate-100/90 dark:bg-zinc-950/80 backdrop-blur-md shrink-0 justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-400" />
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 tracking-wide">Source</div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 mx-1" />
              <Select value={sourceDialect} onValueChange={(v: string | null) => {
                if (!v) return;
                const newSource = v as SqlDialect;
                if (newSource === targetDialect) {
                  swapDialects();
                } else {
                  setSourceDialect(newSource);
                }
              }}>
                <SelectTrigger className="w-auto border-0 bg-transparent h-8 text-xs font-mono text-slate-700 dark:text-zinc-200 focus:ring-0 px-2 py-0 hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-md transition-all shadow-none">
                  <SelectValue placeholder="Select dialect" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 shadow-2xl rounded-xl">
                  <DialectOptions />
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={handleTranspile}
              disabled={isTranspiling}
              size="sm"
              className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-md px-3 shadow-md border border-indigo-500/50 transition-all duration-300"
            >
              {isTranspiling ? <Loader2 className="animate-spin w-3 h-3 mr-1.5" /> : null}
              Transpile
            </Button>
          </div>
          {/* Editor Container */}
          <div className="flex-1 relative overflow-hidden bg-white dark:bg-black/20">
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

        {/* TARGET PANE */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
          {/* Pane Toolbar */}
          <div className="h-11 flex items-center px-4 border-b border-slate-200 dark:border-white/5 bg-slate-100/90 dark:bg-zinc-950/80 backdrop-blur-md shrink-0 justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 tracking-wide">Target</div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 mx-1" />
              <Select value={targetDialect} onValueChange={(v: string | null) => {
                if (!v) return;
                const newTarget = v as SqlDialect;
                if (newTarget === sourceDialect) {
                  swapDialects();
                } else {
                  setTargetDialect(newTarget);
                }
              }}>
                <SelectTrigger className="w-auto border-0 bg-transparent h-8 text-xs font-mono text-indigo-600 dark:text-indigo-400 focus:ring-0 px-2 py-0 hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-md transition-all shadow-none">
                  <SelectValue placeholder="Select dialect" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 shadow-2xl rounded-xl">
                  <DialectOptions />
                </SelectContent>
              </Select>
              {isTranspiling && <Loader2 className="animate-spin w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 ml-2" />}
            </div>

            {/* Target Actions */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-slate-200/50 dark:bg-white/5 rounded-md p-0.5 border border-slate-300 dark:border-white/5">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-300/50 dark:hover:bg-white/5 rounded-sm transition-colors" onClick={() => handleFeedback(true)}>
                  <ThumbsUp size={13} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-300/50 dark:hover:bg-white/5 rounded-sm transition-colors" onClick={() => handleFeedback(false)}>
                  <ThumbsDown size={13} />
                </Button>
              </div>

              <div className="w-[1px] h-4 bg-slate-300 dark:bg-white/10 mx-1"></div>

              <Button
                variant="default"
                size="sm"
                className="h-8 text-xs bg-indigo-100 dark:bg-indigo-600 text-indigo-700 dark:text-white hover:bg-indigo-200 dark:hover:bg-indigo-500 shadow-md dark:shadow-[0_0_15px_rgba(79,70,229,0.3)] dark:hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-indigo-200 dark:border-indigo-500/50 rounded-md px-3 transition-all duration-300"
                onClick={() => {
                  if (!user) {
                    window.location.href = "/login";
                    return;
                  }
                  setShowRefinement(!showRefinement);
                }}
              >
                <Sparkles size={13} className="mr-1.5" /> 
                {isRefining ? "Refining..." : "Refine AI"}
              </Button>
            </div>
          </div>

           {/* Editor Container */}
          <div className="flex-1 relative overflow-hidden bg-slate-50/50 dark:bg-black/20">
            <div className="absolute top-3 right-5 z-10 opacity-30 text-[10px] font-mono text-slate-400 dark:text-zinc-500 pointer-events-none select-none tracking-widest">OUTPUT</div>
            <Editor
              height="100%"
              language="sql"
              theme={isDark ? "vs-dark" : "vs-light"}
              value={targetCode}
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
          </div>

          {/* AI Refinement Integrated Panel */}
          {showRefinement && (
            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-300 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-[0_-20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-20 animate-in slide-in-from-bottom flex flex-col transition-colors">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
                  <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                    <Sparkles size={12} />
                  </div>
                  <span className="text-xs font-semibold tracking-wide">AI Refinement Instructions</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-white rounded-md bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors" onClick={() => setShowRefinement(false)}>
                  <Minimize2 size={13} />
                </Button>
              </div>
              <div className="p-5 flex gap-4">
                <Textarea 
                  placeholder="e.g. Highlight uppercase logic, strictly quote all columns, or map to explicit date functions..." 
                  className="flex-1 resize-none bg-white dark:bg-black/50 border-slate-300 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-indigo-500 text-sm min-h-[70px] placeholder:text-slate-400 dark:placeholder:text-zinc-600 rounded-lg shadow-inner text-slate-800 dark:text-zinc-300"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleRefine();
                    }
                  }}
                  autoFocus
                />
                <Button 
                  onClick={handleRefine} 
                  disabled={isRefining || !instructions.trim()} 
                  className="bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 shrink-0 h-auto py-2 px-6 rounded-lg font-semibold shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isRefining ? <Loader2 className="animate-spin h-4 w-4" /> : "Run Refinement"}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Footer / Status Bar Area */}
      <footer className="h-7 shrink-0 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-zinc-950 flex items-center px-6 justify-between text-[11px] text-slate-500 dark:text-zinc-500 font-mono z-20 relative transition-colors">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2 group cursor-pointer hover:text-slate-700 dark:hover:text-zinc-300 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-green-400 opacity-30 dark:opacity-20"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600 dark:bg-green-500"></span>
            </span>
            Transpiler Online
          </span>
          <span className="flex items-center gap-1.5"><Sparkles size={11} className="text-indigo-500 dark:text-indigo-500/70" /> DeepSeek-R1 Ready</span>
        </div>
        <div className="flex items-center gap-4 hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer transition-colors">
          <Settings2 size={13} /> Preferences
        </div>
      </footer>

    </div>
  );
}
