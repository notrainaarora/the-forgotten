import { randomUUID } from "crypto";
import { z } from "zod";
import { isConfigured, serviceClient } from "@/lib/supabase";
import { json, rateLimited, readJson } from "@/lib/http";

// Step 1 of a submission: hand the browser one-time upload links so files go
// straight to private storage (avoids server body-size limits).

const MAX_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic" };
const CONSENT_TYPES: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/heic": "heic" };

const schema = z.object({
  submission_id: z.string().uuid().optional(),
  files: z
    .array(z.object({ kind: z.enum(["consent", "photo"]), type: z.string(), size: z.number().int().positive() }))
    .min(1)
    .max(9),
});

export async function POST(req: Request) {
  if (rateLimited(req, "uploads", 20)) return json({ error: "Too many attempts. Please wait a few minutes." }, 429);
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: "Invalid upload request" }, 400);
  const { files } = parsed.data;
  const submissionId = parsed.data.submission_id ?? randomUUID();

  if (files.filter((f) => f.kind === "consent").length > 1) return json({ error: "Only one consent file" }, 400);
  if (files.filter((f) => f.kind === "photo").length > 8) return json({ error: "Up to 8 photos" }, 400);
  for (const f of files) {
    const allowed = f.kind === "photo" ? PHOTO_TYPES : CONSENT_TYPES;
    if (!allowed[f.type]) return json({ error: `That file type isn't supported (${f.type || "unknown"}).` }, 400);
    if (f.size > MAX_BYTES) return json({ error: "Each file must be 10 MB or smaller." }, 400);
  }

  if (!isConfigured) {
    // Demo mode: pretend, so the form can be tried end to end.
    return json({
      demo: true,
      submission_id: submissionId,
      uploads: files.map((f, i) => ({ kind: f.kind, bucket: "demo", path: `submissions/${submissionId}/${f.kind}-${i}`, token: "" })),
    });
  }

  const supabase = serviceClient();
  const uploads = [];
  for (const [i, f] of files.entries()) {
    const bucket = f.kind === "photo" ? "story-photos" : "consent-forms";
    const ext = (f.kind === "photo" ? PHOTO_TYPES : CONSENT_TYPES)[f.type];
    const path = `submissions/${submissionId}/${f.kind}-${i}-${randomUUID().slice(0, 8)}.${ext}`;
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
    if (error || !data) {
      console.error("createSignedUploadUrl", error);
      return json({ error: "Couldn't prepare the upload. Please try again." }, 500);
    }
    uploads.push({ kind: f.kind, bucket, path, token: data.token });
  }
  return json({ submission_id: submissionId, uploads });
}
