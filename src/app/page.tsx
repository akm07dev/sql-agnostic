"use client";

/**
 * SQLAgnostic - Main Workbench
 * 
 * This is the core IDE component for the SQLAgnostic platform.
 * It handles the deterministic transpilation of SQL via SQLGlot
 * and adds an AI-powered refinement layer via Groq/Llama-3.
 */

import { useState, useEffect } from "react";
import { Editor, DiffEditor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeftRight, 
  Sparkles, 
  ThumbsDown, 
  ThumbsUp, 
  Code2, 
  ChevronRight, 
  Minimize2, 
  Settings2, 
  Copy, 
  Check, 
  ClipboardPaste 
} from "lucide-react";

// Components
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DialectSelector, DialectIcon } from "@/components/editor/DialectSelector";

// Hooks
import { useAuth } from "@/hooks/useAuth";
import { useSql } from "@/hooks/useSql";
import { useTheme } from "next-themes";
import { getCategorizedDialects, type SqlDialect } from "@/lib/dialects";

export default function Home() {
  // 1. Auth & Context Hooks
  const { user, authLoading, signOut, supabase } = useAuth();
  const { 
    sourceCode, setSourceCode,
    targetCode,
    aiRefinedCode,
    targetView, setTargetView,
    sourceDialect, setSourceDialect,
    targetDialect, setTargetDialect,
    isTranspiling, isRefining,
    aiExplanation,
    handleTranspile, handleRefine
  } = useSql({ user });

  // 2. UI State
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showRefinement, setShowRefinement] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [sourceCopied, setSourceCopied] = useState(false);
  const [targetCopied, setTargetCopied] = useState(false);
  const [sourcePasted, setSourcePasted] = useState(false);

  // 3. Lifecycle & Hydration
  useEffect(() => {
    setMounted(true);
    const savedSource = localStorage.getItem("sqlagnostic_source") as SqlDialect;
    const savedTarget = localStorage.getItem("sqlagnostic_target") as SqlDialect;
    if (savedSource) setSourceDialect(savedSource);
    if (savedTarget) setTargetDialect(savedTarget);
  }, []);

  // 4. Handlers
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
      console.error("Clipboard access denied", err);
    }
  };

  const handleFeedback = async (isPositive: boolean) => {
    if (!isPositive && user) setShowRefinement(true);
    
    supabase.from('feedback').insert({
      user_id: user?.id,
      is_positive: isPositive,
      source_code: sourceCode,
      target_code: targetCode,
      source_dialect: sourceDialect,
      target_dialect: targetDialect
    });
  };

  const swapDialects = () => {
    const temp = sourceDialect;
    setSourceDialect(targetDialect);
    setTargetDialect(temp);
  };

  const isDark = !mounted ? true : (theme === 'system' ? systemTheme === 'dark' : theme === 'dark');

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-300 font-sans relative selection:bg-indigo-200 dark:selection:bg-indigo-500/30 transition-colors duration-500">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-900/10 blur-[120px]" />
      </div>

      <Navbar user={user} authLoading={authLoading} onSignOut={signOut} />

      {/* Main Dialect Control Bar */}
      <div className="w-full flex justify-center items-center py-5 -mb-2 z-10 gap-3 border-b border-transparent bg-slate-50/50 dark:bg-zinc-950/80 backdrop-blur-3xl">
        <DialectSelector 
          value={sourceDialect} 
          onValueChange={(v) => {
            if (v === targetDialect) swapDialects();
            else {
              setSourceDialect(v);
              localStorage.setItem("sqlagnostic_source", v);
            }
          }}
        />

        <Button 
          variant="outline" 
          size="icon" 
          onClick={swapDialects}
          className="h-9 w-9 border-slate-300 dark:border-white/10 bg-white dark:bg-zinc-900 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all hover:rotate-180 duration-500 shadow-sm"
        >
          <ArrowLeftRight size={14} className="text-slate-500 dark:text-zinc-400" />
        </Button>

        <DialectSelector 
          value={targetDialect} 
          onValueChange={(v) => {
            if (v === sourceDialect) swapDialects();
            else {
              setTargetDialect(v);
              localStorage.setItem("sqlagnostic_target", v);
            }
          }}
        />
      </div>

      <main className="flex-1 flex flex-col md:flex-row gap-0 overflow-hidden p-2 md:p-4 lg:p-6 z-10">
        
        {/* Source Panel */}
        <section className="flex-1 flex flex-col border border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-2xl md:rounded-r-none overflow-hidden shadow-sm dark:shadow-none hover:border-slate-300/60 dark:hover:border-white/10 transition-all">
          <div className="h-11 bg-slate-100/40 dark:bg-zinc-800/30 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
              <span className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-zinc-500 uppercase">Input</span>
              <span className="text-[10px] bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-zinc-400 font-mono italic">
                {sourceDialect.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(sourceCode, setSourceCopied)} className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer" title="Copy SQL">
                {sourceCopied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePaste} className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer" title="Paste SQL">
                {sourcePasted ? <Check size={13} className="text-green-500" /> : <ClipboardPaste size={13} />}
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] border-none">
            <Editor
              height="100%"
              defaultLanguage="sql"
              value={sourceCode}
              onChange={(v) => setSourceCode(v || "")}
              theme={isDark ? "vs-dark" : "light"}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: "on",
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
              }}
            />
          </div>
        </section>

        {/* Center Actions */}
        <div className="flex flex-row md:flex-col items-center justify-center p-4 md:p-6 bg-transparent relative z-10 gap-3">
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-slate-200 dark:via-white/5 to-transparent -z-10"></div>
          
          <Button 
            disabled={isTranspiling}
            onClick={handleTranspile}
            className="group relative h-12 w-12 md:h-14 md:w-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-600/20 transition-all hover:scale-110 active:scale-95 flex items-center justify-center p-0 border-0"
          >
            {isTranspiling ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : (
              <div className="relative">
                <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                <div className="absolute inset-0 bg-white/20 blur-lg rounded-full animate-pulse"></div>
              </div>
            )}
          </Button>

          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-600 tracking-tighter uppercase whitespace-nowrap bg-white/50 dark:bg-zinc-900/50 px-2 py-1 rounded border border-slate-200 dark:border-white/5 order-last md:order-none">
            Transpile
          </div>
        </div>

        {/* Target Panel */}
        <section className="flex-1 flex flex-col border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl md:rounded-l-none overflow-hidden shadow-xl dark:shadow-none transition-all">
          <div className="h-11 bg-slate-100/60 dark:bg-zinc-800/60 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between px-4 shrink-0 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 min-w-max">
              <Button 
                variant={targetView === "sqlglot" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setTargetView("sqlglot")}
                className={`h-7 text-[10px] font-bold tracking-wider rounded-md transition-all ${targetView === "sqlglot" ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5"}`}
              >
                SQLGLOT
              </Button>
              {aiRefinedCode && (
                <Button 
                  variant={targetView === "ai" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setTargetView("ai")}
                  className={`h-7 text-[10px] font-bold tracking-wider rounded-md transition-all ${targetView === "ai" ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/20" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5"}`}
                >
                  <Sparkles size={11} className="mr-1.5" />
                  AI REFINED
                </Button>
              )}
              {targetCode && aiRefinedCode && (
                <Button 
                  variant={targetView === "diff" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setTargetView("diff")}
                  className={`h-7 text-[10px] font-bold tracking-wider rounded-md transition-all ${targetView === "diff" ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5"}`}
                >
                  DIFF
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-zinc-800 rounded-md p-0.5">
                 <Button variant="ghost" size="icon" onClick={() => handleFeedback(true)} className="h-6 w-6 text-slate-400 hover:text-green-500 transition-colors" title="Accurate">
                   <ThumbsUp size={11} />
                 </Button>
                 <Button variant="ghost" size="icon" onClick={() => handleFeedback(false)} className="h-6 w-6 text-slate-400 hover:text-red-500 transition-colors" title="Needs Refinement">
                   <ThumbsDown size={11} />
                 </Button>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => copyToClipboard(targetView === "ai" ? aiRefinedCode : targetCode, setTargetCopied)} 
                className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" 
                title="Copy Results"
              >
                {targetCopied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] relative">
            {isRefining && (
              <div className="absolute inset-0 z-30 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-[2px] flex items-center justify-center flex-col gap-3">
                 <div className="relative">
                    <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
                    <Sparkles className="absolute top-0 right-0 w-3 h-3 text-indigo-400 animate-pulse" />
                 </div>
                 <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase animate-pulse">AI Refinement in Progress...</span>
              </div>
            )}
            
            {targetView === "diff" ? (
              <DiffEditor
                height="100%"
                original={targetCode}
                modified={aiRefinedCode}
                language="sql"
                theme={isDark ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  readOnly: true,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                }}
              />
            ) : (
              <Editor
                height="100%"
                defaultLanguage="sql"
                value={targetView === "ai" ? aiRefinedCode : targetCode}
                theme={isDark ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  readOnly: true,
                  lineNumbers: "on",
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                }}
              />
            )}
          </div>

          {/* AI Explanation / Context Area */}
          {targetView === "ai" && aiExplanation && (
            <div className="h-24 bg-indigo-50/50 dark:bg-indigo-950/20 border-t border-indigo-200/50 dark:border-indigo-500/10 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-900 transition-all duration-700 animate-in slide-in-from-bottom-5">
              <div className="flex items-start gap-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-zinc-400 italic">
                  <span className="font-bold not-italic text-indigo-600 dark:text-indigo-400 mr-1 uppercase text-[10px]">AI Insight:</span>
                  {aiExplanation}
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* AI Refinement Overlay - Professional Micro-Interaction */}
      {showRefinement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/20 dark:bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
           <div 
             className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-300"
             onKeyDown={(e) => { if (e.key === 'Escape') setShowRefinement(false); }}
           >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">AI Refinement</h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium">Add instructions to fix missing parts or optimize queries.</p>
                  </div>
                </div>
                
                <Textarea 
                  autoFocus
                  placeholder="e.g., 'Make sure column names are quoted', 'Apply snake_case to aliases', 'Fix the JOIN syntax for Snowflake'..."
                  className="min-h-[120px] bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/40 resize-none transition-all"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
                
                <div className="mt-6 flex items-center justify-end gap-3">
                  <Button variant="ghost" onClick={() => setShowRefinement(false)} className="rounded-xl text-xs font-bold text-slate-500">
                    CANCEL
                  </Button>
                  <Button 
                    onClick={() => handleRefine(instructions)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 text-xs font-bold shadow-lg shadow-indigo-600/20"
                  >
                    REFINE SQL
                  </Button>
                </div>
              </div>
           </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Helper Loader for SSR
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
