"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Globe, Link2, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toggleShare, deleteArtifact } from "@/lib/artifacts";
import { useRouter } from "next/navigation";

export function ShareBar({
  artifactId,
  initialShareToken,
  initialInDirectory,
}: {
  artifactId: string;
  initialShareToken: string | null;
  initialInDirectory: boolean;
}) {
  const router = useRouter();
  const [shareToken, setShareToken] = useState<string | null>(
    initialShareToken,
  );
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isShared = !!shareToken;
  const shareUrl =
    typeof window !== "undefined" && shareToken
      ? `${window.location.origin}/s/${shareToken}`
      : "";
  const directoryLocked = isShared && initialInDirectory;
  const toggleHint = directoryLocked
    ? "Remove from the SVS Directory first."
    : undefined;

  const onToggle = () => {
    if (directoryLocked) return;
    startTransition(async () => {
      const res = await toggleShare(artifactId, !isShared);
      if ("error" in res) return;
      setShareToken(res.share_token ?? null);
      router.refresh();
    });
  };

  const onCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-b-[1.5px] border-ink/12 bg-paper-deep/40 px-4 py-2.5 text-sm">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-ink bg-paper-soft shadow-[2px_2px_0_var(--ink)]">
          {isShared ? (
            <Globe className="h-4 w-4 text-orange-deep" />
          ) : (
            <Lock className="h-4 w-4 text-ink-mute" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-ink">
            {isShared ? "Public artifact" : "Private artifact"}
          </span>
          <span className="block truncate text-xs text-ink-mute">
            {isShared
              ? "Anyone with the link can view the rendered artifact."
              : "Only your account can open this artifact."}
          </span>
        </span>
      </div>
      <div className="ml-auto flex min-w-0 flex-wrap items-center gap-2">
        {isShared && (
          <div className="flex min-w-0 items-center gap-1 rounded-lg border-[1.5px] border-ink/25 bg-paper-soft px-2">
            <Link2 className="h-3.5 w-3.5 text-ink-mute" />
            <Input
              readOnly
              value={shareUrl}
              className="h-7 w-72 max-w-[55vw] border-0 px-1 text-xs code-font focus-visible:ring-0"
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onCopy}
              className="h-7 px-2"
              aria-label="Copy share link"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-orange-deep" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        )}
        <Button
          size="sm"
          variant={isShared ? "secondary" : "primary"}
          onClick={onToggle}
          disabled={pending || directoryLocked}
          title={toggleHint}
        >
          {isShared ? "Make private" : "Share"}
        </Button>
        {confirmingDelete ? (
          <form action={deleteArtifact} className="flex items-center gap-1">
            <input type="hidden" name="id" value={artifactId} />
            <Button size="sm" variant="destructive" type="submit">
              <Trash2 className="h-3.5 w-3.5" />
              Confirm
            </Button>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmingDelete(true)}
            aria-label="Delete artifact"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
