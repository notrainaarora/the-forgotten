import { z } from "zod";

const text = (min: number, max: number, label: string) =>
  z.string().trim().min(min, `${label} is too short`).max(max, `${label} is too long`);
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : null));

export const SUBMISSION_PREFIX = /^submissions\/[0-9a-f-]{36}\//;

export const submissionSchema = z
  .object({
    // honeypot: must stay empty
    website: z.string().max(0).optional(),
    submission_id: z.string().uuid(),

    title: text(3, 140, "Title"),
    summary: text(20, 400, "Summary"),
    body: text(200, 20000, "Story"),
    pull_quote: optionalText(280),
    format: z.enum(["written", "interview", "photo_essay"]),
    themes: z.array(z.string().max(40)).max(5).default([]),

    subject_display_name: text(1, 80, "Name to use"),
    subject_type: z.enum(["veteran", "senior", "other"]),
    subject_type_other: optionalText(80),
    service_branch: optionalText(60),
    service_era: optionalText(60),

    city: optionalText(80),
    region: text(2, 80, "State / region"),
    country: text(2, 80, "Country").default("United States"),

    interview_setting: z.enum(["public_place", "supervised", "partner_org", "family_member", "other"]),
    partner_org: optionalText(120),

    contributor_name: text(2, 100, "Your name"),
    contributor_credit: text(2, 60, "Credit line"),
    contributor_email: z.string().trim().email("Enter a valid email").max(200),
    contributor_school: optionalText(120),
    contributor_age_group: z.enum(["13-17", "18+"]),
    age_13_plus: z.literal(true, { error: "Contributors must be 13 or older" }),
    guardian_name: optionalText(100),
    guardian_email: z.string().trim().email().max(200).optional().or(z.literal("")).transform((v) => v || null),
    guardian_approved: z.boolean().default(false),

    consent_signed_by: text(1, 100, "Who signed the consent form"),
    consent_signed_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the date signed"),
    consent_file_path: z.string().regex(SUBMISSION_PREFIX, "Upload the signed consent form"),
    consent_real_name: z.boolean().default(false),
    consent_photos: z.boolean().default(false),
    consent_book: z.boolean().default(false),

    photos: z
      .array(
        z.object({
          path: z.string().regex(SUBMISSION_PREFIX),
          caption: optionalText(300),
          alt_text: optionalText(300),
        })
      )
      .max(8)
      .default([]),

    attest_truthful: z.literal(true, { error: "Please confirm this box" }),
    attest_guidelines: z.literal(true, { error: "Please confirm this box" }),
  })
  .superRefine((v, ctx) => {
    if (v.contributor_age_group === "13-17") {
      if (!v.guardian_name) ctx.addIssue({ code: "custom", path: ["guardian_name"], message: "A parent or guardian's name is required" });
      if (!v.guardian_email) ctx.addIssue({ code: "custom", path: ["guardian_email"], message: "A parent or guardian's email is required" });
      if (!v.guardian_approved) ctx.addIssue({ code: "custom", path: ["guardian_approved"], message: "A parent or guardian must approve" });
    }
    if (v.photos.length > 0 && !v.consent_photos) {
      ctx.addIssue({ code: "custom", path: ["consent_photos"], message: "Photos can only be included if the person agreed to them" });
    }
    if (v.subject_type === "other" && !v.subject_type_other) {
      ctx.addIssue({ code: "custom", path: ["subject_type_other"], message: "Tell us a little about who this person is" });
    }
    const all = [v.consent_file_path, ...v.photos.map((p) => p.path)];
    if (!all.every((p) => p.startsWith(`submissions/${v.submission_id}/`))) {
      ctx.addIssue({ code: "custom", path: ["consent_file_path"], message: "Upload mismatch — please re-upload your files" });
    }
    const signed = new Date(v.consent_signed_on);
    if (isNaN(signed.getTime()) || signed > new Date(Date.now() + 86400000)) {
      ctx.addIssue({ code: "custom", path: ["consent_signed_on"], message: "Enter a real date that isn't in the future" });
    }
  });

export type Submission = z.infer<typeof submissionSchema>;

export const signupSchema = z
  .object({
    website: z.string().max(0).optional(),
    name: text(2, 100, "Name"),
    email: z.string().trim().email("Enter a valid email").max(200),
    age_group: z.enum(["13-17", "18+"]),
    age_13_plus: z.literal(true, { error: "Contributors must be 13 or older" }),
    school: optionalText(120),
    city: optionalText(80),
    region: optionalText(80),
    country: optionalText(80),
    guardian_email: z.string().trim().email().max(200).optional().or(z.literal("")).transform((v) => v || null),
    interests: z.array(z.enum(["interview", "write", "photograph", "partner", "chapter", "other"])).default([]),
    message: optionalText(2000),
  })
  .superRefine((v, ctx) => {
    if (v.age_group === "13-17" && !v.guardian_email) {
      ctx.addIssue({ code: "custom", path: ["guardian_email"], message: "A parent or guardian's email is required for contributors under 18" });
    }
  });

export const withdrawSchema = z.object({
  website: z.string().max(0).optional(),
  story_reference: text(3, 300, "Story title or link"),
  requester_name: text(2, 100, "Your name"),
  requester_email: z.string().trim().email("Enter a valid email").max(200),
  relationship: z.enum(["subject", "family", "contributor", "other"]),
  reason: optionalText(2000),
});

/** Flatten zod errors into { field: message } for the forms. */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
