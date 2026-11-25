import { revalidatePath } from "next/cache";
import { fieldErrors, submissionSchema } from "@/lib/validation";
import { isConfigured, serviceClient } from "@/lib/supabase";
import { json, rateLimited, readJson } from "@/lib/http";
import { verifyHuman } from "@/lib/turnstile";
import { logActivity } from "@/lib/activity";
import { emailNewSubmission, emailSubmissionReceived } from "@/lib/email";

// Step 2 of a submission: validate everything, confirm the files really
// landed in storage, then save the story as "pending" for review.

export async function POST(req: Request) {
  if (rateLimited(req, "submit", 6)) return json({ error: "Too many submissions. Please wait a few minutes." }, 429);
  const raw = (await readJson(req)) as Record<string, unknown> | null;
  if (!(await verifyHuman(raw?.turnstile_token, req))) return json({ error: "Please complete the security check and try again." }, 400);
  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) return json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, 400);
  const v = parsed.data;

  if (!isConfigured) return json({ ok: true, demo: true });

  const supabase = serviceClient();
  const folder = `submissions/${v.submission_id}`;

  // Make sure the uploaded files exist (and belong to this submission).
  const [consentList, photoList] = await Promise.all([
    supabase.storage.from("consent-forms").list(folder),
    supabase.storage.from("story-photos").list(folder),
  ]);
  const consentNames = new Set((consentList.data ?? []).map((o) => `${folder}/${o.name}`));
  const photoNames = new Set((photoList.data ?? []).map((o) => `${folder}/${o.name}`));
  if (!consentNames.has(v.consent_file_path)) {
    return json({ error: "We couldn't find your consent form upload. Please attach it again.", fields: { consent_file_path: "Please re-upload" } }, 400);
  }
  if (!v.photos.every((p) => photoNames.has(p.path))) {
    return json({ error: "One of your photos didn't finish uploading. Please try again." }, 400);
  }

  const { data: story, error } = await supabase
    .from("stories")
    .insert({
      status: "pending",
      title: v.title,
      summary: v.summary,
      body: v.body,
      pull_quote: v.pull_quote,
      format: v.format,
      themes: v.themes,
      subject_display_name: v.subject_display_name,
      subject_type: v.subject_type,
      subject_type_other: v.subject_type === "other" ? v.subject_type_other : null,
      service_branch: v.subject_type === "veteran" ? v.service_branch : null,
      service_era: v.subject_type === "veteran" ? v.service_era : null,
      city: v.city,
      region: v.region,
      country: v.country,
      interview_setting: v.interview_setting,
      partner_org: v.partner_org,
      contributor_name: v.contributor_name,
      contributor_credit: v.contributor_credit,
      contributor_email: v.contributor_email.toLowerCase(),
      contributor_school: v.contributor_school,
      contributor_age_group: v.contributor_age_group,
      guardian_name: v.contributor_age_group === "13-17" ? v.guardian_name : null,
      guardian_email: v.contributor_age_group === "13-17" ? v.guardian_email : null,
      guardian_approved: v.contributor_age_group === "13-17" ? v.guardian_approved : false,
      consent_signed_by: v.consent_signed_by,
      consent_signed_on: v.consent_signed_on,
      consent_file_path: v.consent_file_path,
      consent_real_name: v.consent_real_name,
      consent_photos: v.consent_photos,
      consent_book: v.consent_book,
    })
    .select("id")
    .single();

  if (error || !story) {
    console.error("insert story", error);
    return json({ error: "Something went wrong saving your story. Please try again." }, 500);
  }

  if (v.photos.length) {
    const { error: photoErr } = await supabase.from("story_photos").insert(
      v.photos.map((p, i) => ({ story_id: story.id, storage_path: p.path, caption: p.caption, alt_text: p.alt_text, sort_order: i }))
    );
    if (photoErr) console.error("insert photos", photoErr);
  }

  await Promise.all([
    logActivity({ action: "story.submitted", targetType: "story", targetId: story.id, summary: `${v.contributor_name} submitted "${v.title}" (${v.subject_display_name}, ${v.region})` }),
    emailNewSubmission({ id: story.id, title: v.title, subject: v.subject_display_name, contributor: v.contributor_name }),
    emailSubmissionReceived({ to: v.contributor_email, guardian: v.contributor_age_group === "13-17" ? v.guardian_email : null, name: v.contributor_name.split(" ")[0], subject: v.subject_display_name }),
  ]);
  revalidatePath("/admin", "layout");
  return json({ ok: true });
}
