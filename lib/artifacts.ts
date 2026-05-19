"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import type { ArtifactKind, ArtifactFile } from "@/lib/renderer";

const MAX_BUNDLE_BYTES = 6 * 1024 * 1024;

function fileByteSize(f: ArtifactFile): number {
  if (!f.content) return 0;
  return f.encoding === "base64"
    ? Buffer.from(f.content, "base64").length
    : Buffer.byteLength(f.content, "utf8");
}

function bundleTooBig(files: ArtifactFile[]): string | null {
  const total = files.reduce((sum, f) => sum + fileByteSize(f), 0);
  if (total > MAX_BUNDLE_BYTES) {
    const mb = (total / 1024 / 1024).toFixed(1);
    const limit = (MAX_BUNDLE_BYTES / 1024 / 1024).toFixed(0);
    return `Artifact is ${mb} MB. Limit is ${limit} MB — compress images or remove files.`;
  }
  return null;
}

async function getShareToken(id: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artifacts")
    .select("share_token")
    .eq("id", id)
    .maybeSingle();
  return (data?.share_token as string | null) ?? null;
}

function bustShares(tokens: Array<string | null>) {
  const seen = new Set<string>();
  for (const t of tokens) {
    if (t && !seen.has(t)) {
      seen.add(t);
      revalidatePath(`/s/${t}`);
    }
  }
}

export async function createArtifact(input: {
  title: string;
  kind: ArtifactKind;
  files: ArtifactFile[];
  entry: string | null;
  description?: string | null;
  inDirectory?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not signed in" };
  }

  if (!input.files.length) {
    return { error: "Add at least one file" };
  }

  const sizeError = bundleTooBig(input.files);
  if (sizeError) return { error: sizeError };

  const { data, error } = await supabase
    .from("artifacts")
    .insert({
      owner: user.id,
      owner_email: user.email ?? null,
      title: input.title.trim() || "Untitled",
      kind: input.kind,
      files: input.files,
      entry: input.entry,
      description: input.description?.trim() || null,
      in_directory: input.inDirectory ?? false,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  if (input.inDirectory) revalidatePath("/directory");
  return { id: data.id };
}

export async function updateArtifact(
  id: string,
  patch: {
    title?: string;
    files?: ArtifactFile[];
    entry?: string | null;
    kind?: ArtifactKind;
    description?: string | null;
    inDirectory?: boolean;
  },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  if (patch.files) {
    const sizeError = bundleTooBig(patch.files);
    if (sizeError) return { error: sizeError };
  }

  const normalized = { ...patch } as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(patch, "description")) {
    normalized.description = patch.description?.trim() || null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "inDirectory")) {
    normalized.in_directory = patch.inDirectory;
    delete normalized.inDirectory;
  }

  const existingToken = await getShareToken(id);

  const { error } = await supabase
    .from("artifacts")
    .update(normalized)
    .eq("id", id)
    .eq("owner", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/directory");
  revalidatePath(`/a/${id}`);
  revalidatePath(`/d/${id}`);
  bustShares([existingToken]);
  return { ok: true };
}

export async function toggleDirectory(id: string, inDirectory: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { error } = await supabase
    .from("artifacts")
    .update({ in_directory: inDirectory })
    .eq("id", id)
    .eq("owner", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/directory");
  return { in_directory: inDirectory };
}

export async function toggleShare(id: string, share: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const existingToken = await getShareToken(id);
  const share_token = share ? nanoid(12) : null;

  const { error } = await supabase
    .from("artifacts")
    .update({ share_token })
    .eq("id", id)
    .eq("owner", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/directory");
  revalidatePath(`/a/${id}`);
  bustShares([existingToken, share_token]);
  return { share_token };
}

export async function deleteArtifact(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const existingToken = await getShareToken(id);

  await supabase
    .from("artifacts")
    .delete()
    .eq("id", id)
    .eq("owner", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/directory");
  bustShares([existingToken]);
  redirect("/dashboard");
}
