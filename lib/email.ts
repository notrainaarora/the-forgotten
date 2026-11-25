import "server-only";
import { isConfigured, serviceClient } from "./supabase";
import { SITE } from "./constants";

// Email via Resend (resend.com, free tier). Optional: if RESEND_API_KEY isn't set,
// emails are skipped and everything else still works.
const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "The Forgotten <stories@theforgotten.site>";

export const emailEnabled = Boolean(KEY);

async function send(to: string[], subject: string, text: string, cc?: string[]) {
  if (!KEY || to.length === 0) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, cc, subject, text, reply_to: SITE.contactEmail }),
    });
    if (!res.ok) console.error("email failed", res.status, await res.text());
  } catch (e) {
    console.error("email error", e);
  }
}

/** Owner email addresses: NOTIFY_EMAIL if set, otherwise every owner on the team. */
async function ownerEmails(): Promise<string[]> {
  if (process.env.NOTIFY_EMAIL) return process.env.NOTIFY_EMAIL.split(",").map((s) => s.trim()).filter(Boolean);
  if (!isConfigured) return [];
  const { data } = await serviceClient().from("admins").select("email").eq("role", "owner");
  return (data ?? []).map((r) => r.email);
}

const sign = `\n\nWith gratitude,\nThe Forgotten\n${SITE.url}`;

export async function emailNewSubmission(s: { id: string; title: string; subject: string; contributor: string }) {
  await send(
    await ownerEmails(),
    `New story to review: "${s.title}"`,
    `${s.contributor} submitted a story about ${s.subject}.\n\nReview it here: ${SITE.url}/admin/stories/${s.id}`
  );
}

export async function emailSubmissionReceived(s: { to: string; guardian?: string | null; name: string; subject: string }) {
  await send(
    [s.to],
    `We received ${s.subject}'s story`,
    `Hi ${s.name},\n\nThank you for sharing ${s.subject}'s story with The Forgotten. Our team reviews every submission for accuracy, dignity, and safety before it's published. We'll email you when it goes live, or if we have any questions.${sign}`,
    s.guardian ? [s.guardian] : undefined
  );
}

export async function emailStoryPublished(s: { to: string; name: string; subject: string; slug: string }) {
  await send(
    [s.to],
    `${s.subject}'s story is live`,
    `Hi ${s.name},\n\n${s.subject}'s story is now published on The Forgotten:\n${SITE.url}/stories/${s.slug}\n\nConsider sharing the link with ${s.subject} and anyone who helped. Thank you for listening.${sign}`
  );
}

export async function emailNewWithdrawal(w: { story: string; from: string }) {
  await send(await ownerEmails(), `Withdrawal request: ${w.story}`, `${w.from} asked to change or remove a story.\n\nHandle it here: ${SITE.url}/admin/inbox`);
}

export async function emailWelcomeContributor(s: { to: string; guardian?: string | null; name: string }) {
  await send(
    [s.to],
    "Welcome to The Forgotten",
    `Hi ${s.name},\n\nThanks for signing up to be a contributor! Here's how to get started:\n\n1. Read the interview guide: ${SITE.url}/get-involved#guide\n2. Print the consent form: ${SITE.url}/consent-form\n3. When you've documented a story, submit it: ${SITE.url}/share\n\nReply to this email with any questions.${sign}`,
    s.guardian ? [s.guardian] : undefined
  );
}
