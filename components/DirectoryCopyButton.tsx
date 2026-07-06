"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DirectoryCopyButton({
  shareToken,
  title,
}: {
  shareToken: string | null;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!shareToken) {
    return (
      <span className="text-xs text-ink-mute" aria-label="No public URL">
        —
      </span>
    );
  }

  const onCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/s/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span
      className="relative z-10 inline-flex"
      onClick={(event) => event.stopPropagation()}
    >
      <Button
        size="sm"
        variant="ghost"
        onClick={onCopy}
        className="h-8 px-2"
        aria-label={`Copy public URL for ${title}`}
        title={copied ? "Copied" : "Copy public URL"}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-amber-deep" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </span>
  );
}
