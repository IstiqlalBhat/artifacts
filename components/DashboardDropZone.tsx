"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileCode2, FolderPlus, Loader2 } from "lucide-react";
import { createArtifact } from "@/lib/artifacts";
import {
  inferKind,
  type ArtifactFile,
  type ArtifactKind,
} from "@/lib/renderer";

const SUPPORTED = /\.(html?|css|m?js|jsx|tsx|ts)$/i;
const MAX_FILES = 50;

const baseName = (path: string) => path.split("/").pop() ?? path;
const isRoot = (path: string) => !path.includes("/");

function pickEntry(
  files: ArtifactFile[],
  kind: ArtifactKind,
):
  | { ambiguous: false; entry: string | null }
  | { ambiguous: true; candidates: ArtifactFile[] } {
  const isCandidate =
    kind === "jsx"
      ? (n: string) => /\.(jsx|tsx)$/i.test(n)
      : (n: string) => /\.html?$/i.test(n);
  const isCanonical =
    kind === "jsx"
      ? (n: string) => /^(App|Main|index|Page)\.(jsx|tsx)$/i.test(baseName(n))
      : (n: string) => /^index\.html?$/i.test(baseName(n));

  const candidates = files.filter((f) => isCandidate(f.name));
  if (candidates.length === 0) return { ambiguous: false, entry: null };
  if (candidates.length === 1)
    return { ambiguous: false, entry: candidates[0].name };

  const rootCanonical = candidates.filter(
    (f) => isRoot(f.name) && isCanonical(f.name),
  );
  if (rootCanonical.length === 1)
    return { ambiguous: false, entry: rootCanonical[0].name };

  const rootOnly = candidates.filter((f) => isRoot(f.name));
  if (rootOnly.length === 1)
    return { ambiguous: false, entry: rootOnly[0].name };

  return { ambiguous: true, candidates };
}

function detectType(name: string): string {
  if (/\.html?$/i.test(name)) return "text/html";
  if (/\.css$/i.test(name)) return "text/css";
  if (/\.m?js$/i.test(name)) return "text/javascript";
  if (/\.tsx?$/i.test(name)) return "text/typescript";
  if (/\.jsx$/i.test(name)) return "text/jsx";
  return "text/plain";
}

function readDir(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => reader.readEntries(resolve, reject));
}

function entryToFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

async function walk(
  entry: FileSystemEntry,
  prefix: string,
): Promise<Array<{ path: string; file: File }>> {
  if (entry.isFile) {
    const file = await entryToFile(entry as FileSystemFileEntry);
    return [{ path: prefix + entry.name, file }];
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const all: FileSystemEntry[] = [];
    // readEntries returns at most ~100 per call — loop until empty.
    while (true) {
      const batch = await readDir(reader);
      if (!batch.length) break;
      all.push(...batch);
    }
    const out: Array<{ path: string; file: File }> = [];
    const next = `${prefix}${entry.name}/`;
    for (const child of all) {
      out.push(...(await walk(child, next)));
    }
    return out;
  }
  return [];
}

async function collectDropped(dt: DataTransfer): Promise<{
  files: Array<{ path: string; file: File }>;
  rootName: string | null;
}> {
  const items = Array.from(dt.items).filter((i) => i.kind === "file");
  const supportsEntries = items.some(
    (i) => typeof i.webkitGetAsEntry === "function",
  );

  if (supportsEntries) {
    const collected: Array<{ path: string; file: File }> = [];
    let onlyDir: FileSystemDirectoryEntry | null = null;
    let topLevelCount = 0;

    for (const item of items) {
      const entry = item.webkitGetAsEntry?.();
      if (!entry) continue;
      topLevelCount += 1;
      if (entry.isDirectory) onlyDir = entry as FileSystemDirectoryEntry;
      collected.push(...(await walk(entry, "")));
    }

    if (topLevelCount === 1 && onlyDir) {
      const prefix = `${onlyDir.name}/`;
      for (const c of collected) {
        if (c.path.startsWith(prefix)) c.path = c.path.slice(prefix.length);
      }
      return { files: collected, rootName: onlyDir.name };
    }
    return { files: collected, rootName: null };
  }

  return {
    files: Array.from(dt.files).map((file) => ({ path: file.name, file })),
    rootName: null,
  };
}

type Pending = {
  title: string;
  kind: ArtifactKind;
  files: ArtifactFile[];
  candidates: ArtifactFile[];
};

export function DashboardDropZone({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const counter = useRef(0);
  const [hover, setHover] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasFiles = (e: React.DragEvent) =>
    Array.from(e.dataTransfer.types).includes("Files");

  const save = useCallback(
    async (
      title: string,
      kind: ArtifactKind,
      files: ArtifactFile[],
      entry: string | null,
    ) => {
      setBusy(true);
      setError(null);
      try {
        const res = await createArtifact({ title, kind, files, entry });
        if ("error" in res && res.error) {
          setError(res.error);
          return;
        }
        if ("id" in res && res.id) {
          setPending(null);
          router.push(`/a/${res.id}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save artifact.");
      } finally {
        setBusy(false);
      }
    },
    [router],
  );

  const onDragEnter = useCallback((e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    counter.current += 1;
    setHover(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    counter.current -= 1;
    if (counter.current <= 0) {
      counter.current = 0;
      setHover(false);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      counter.current = 0;
      setHover(false);
      setError(null);
      setBusy(true);
      try {
        const { files, rootName } = await collectDropped(e.dataTransfer);
        const supported = files.filter(({ path }) => SUPPORTED.test(path));
        if (!supported.length) {
          setError(
            "No supported files found. Try HTML, CSS, JS, JSX, TS, or TSX (or a folder of them).",
          );
          return;
        }
        if (supported.length > MAX_FILES) {
          setError(
            `That's ${supported.length} files. Cap is ${MAX_FILES} per artifact.`,
          );
          return;
        }

        const artifactFiles: ArtifactFile[] = [];
        for (const { path, file } of supported) {
          const content = await file.text();
          artifactFiles.push({ name: path, type: detectType(path), content });
        }

        const title = rootName ?? "Untitled";
        const kind = inferKind(artifactFiles);
        const decision = pickEntry(artifactFiles, kind);

        if (decision.ambiguous) {
          setPending({
            title,
            kind,
            files: artifactFiles,
            candidates: decision.candidates,
          });
          setBusy(false);
          return;
        }

        await save(title, kind, artifactFiles, decision.entry);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't read those files.");
        setBusy(false);
      }
    },
    [save],
  );

  const confirmEntry = useCallback(
    (entry: string | null) => {
      if (!pending) return;
      void save(pending.title, pending.kind, pending.files, entry);
    },
    [pending, save],
  );

  const cancelPending = useCallback(() => {
    setPending(null);
    setError(null);
  }, []);

  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex flex-1 flex-col"
    >
      {children}

      {(hover || (busy && !pending)) && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex max-w-md flex-col items-center gap-3 rounded-lg border-2 border-dashed border-accent bg-card px-8 py-10 text-center shadow-xl shadow-primary/10">
            {busy ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <p className="text-sm font-medium">Creating artifact...</p>
              </>
            ) : (
              <>
                <FolderPlus className="h-8 w-8 text-accent" />
                <p className="text-base font-semibold">
                  Drop to create a new artifact
                </p>
                <p className="text-xs text-muted-foreground">
                  Folder name becomes the title. HTML, CSS, JS, JSX, TS, TSX are
                  imported with their relative paths.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-[min(30rem,100%)] rounded-lg border border-border bg-card p-6 shadow-xl shadow-primary/10">
            <h2 className="text-base font-semibold">Pick the entry file</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {pending.candidates.length}{" "}
              {pending.kind === "jsx" ? "JSX/TSX" : "HTML"} files were found.
              The one you pick runs first in the preview.
            </p>
            {error && (
              <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
            <ul className="scroll-thin mt-4 max-h-64 space-y-1.5 overflow-auto pr-1">
              {pending.candidates.map((f) => (
                <li key={f.name}>
                  <button
                    type="button"
                    onClick={() => confirmEntry(f.name)}
                    disabled={busy}
                    className="group flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:border-accent/40 hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FileCode2 className="h-3.5 w-3.5 shrink-0 text-accent" />
                    <span className="code-font min-w-0 flex-1 truncate">
                      {f.name}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={cancelPending}
                disabled={busy}
                className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmEntry(null)}
                disabled={busy}
                className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
              >
                {busy ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Decide later"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && !busy && !pending && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-destructive/70 transition-colors hover:text-destructive"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
