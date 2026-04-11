"use client";

import { useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";

interface MobileCodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
  readOnly?: boolean;
  height?: string;
}

export function MobileCodeMirrorEditor({
  value,
  onChange,
  isDark,
  readOnly = false,
  height = "100%"
}: MobileCodeMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const extensions = [
    sql(),
    EditorView.lineWrapping,
    EditorView.theme({
      "&": {
        height: height,
        fontSize: "14px",
        fontFamily: "var(--font-geist-mono), 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
      },
      ".cm-editor": {
        height: "100%",
        outline: "none",
      },
      ".cm-focused": {
        outline: "none",
      },
      ".cm-content": {
        padding: "16px 0",
        minHeight: "100%",
      },
      ".cm-line": {
        padding: "0 16px",
        lineHeight: "1.5",
      },
      ".cm-cursor": {
        borderLeft: "2px solid currentColor",
      },
      "&.cm-focused .cm-selectionBackground": {
        backgroundColor: "rgba(66, 153, 225, 0.3)",
      },
    }),
  ];

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.stopPropagation();
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("touchstart", handleTouchStart, { passive: false });
      return () => {
        editor.removeEventListener("touchstart", handleTouchStart);
      };
    }
  }, []);

  return (
    <div ref={editorRef} className="h-full w-full">
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={isDark ? oneDark : "light"}
        extensions={extensions}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: !readOnly,
          highlightSelectionMatches: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          searchKeymap: false,
          historyKeymap: true,
          foldKeymap: false,
        }}
        style={{
          height: height,
          fontSize: "14px",
        }}
      />
    </div>
  );
}
