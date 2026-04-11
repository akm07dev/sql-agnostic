"use client";

import { useIsMobile } from "@/hooks/useIsMobile";
import { DesktopMonacoEditor } from "./DesktopMonacoEditor";
import { MobileCodeMirrorEditor } from "./MobileCodeMirrorEditor";

interface AdaptiveEditorProps {
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
  readOnly?: boolean;
}

export function AdaptiveEditor({
  value,
  onChange,
  isDark,
  readOnly = false
}: AdaptiveEditorProps) {
  const isMobile = useIsMobile();

  // Use Monaco for desktop, CodeMirror for mobile/tablet
  if (isMobile) {
    return (
      <MobileCodeMirrorEditor
        value={value}
        onChange={onChange}
        isDark={isDark}
        readOnly={readOnly}
      />
    );
  }

  return (
    <DesktopMonacoEditor
      value={value}
      onChange={onChange}
      isDark={isDark}
      readOnly={readOnly}
    />
  );
}