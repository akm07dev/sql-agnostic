"use client";

import { Editor } from "@monaco-editor/react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface MobileAdaptiveEditorProps {
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
}

export function MobileAdaptiveEditor({ value, onChange, isDark }: MobileAdaptiveEditorProps) {
  const isMobile = useIsMobile();
  
  return (
    <Editor
      height="100%"
      language="sql"
      theme={isDark ? "vs-dark" : "vs-light"}
      value={value}
      onChange={(v) => onChange(v || "")}
      options={{
        minimap: { enabled: false },
        fontSize: isMobile ? 16 : 13,
        fontFamily: "var(--font-geist-mono), monospace",
        scrollBeyondLastLine: false,
        lineHeight: isMobile ? 28 : 24,
        padding: { top: 20 },
        quickSuggestions: false,
        renderLineHighlight: "all",
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        automaticLayout: true,
        lineNumbers: isMobile ? "off" : "on",
        folding: !isMobile,
        contextmenu: true,
        scrollbar: {
          vertical: "auto",
          horizontal: "auto",
          useShadows: false,
          verticalHasArrows: false,
          horizontalHasArrows: false,
        },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        readOnly: false,
        fixedOverflowWidgets: true,
        // Mobile-specific settings to enable input
        links: false,
        occurrencesHighlight: "off",
        selectionHighlight: false,
        matchBrackets: "never",
        parameterHints: { enabled: false },
        hover: { enabled: false },
        wordWrap: "on",
      }}
    />
  );
}
