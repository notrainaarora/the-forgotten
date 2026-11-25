import { fieldErrors, withdrawSchema } from "@/lib/validation";
import { isConfigured, serviceClient } from "@/lib/supabase";
import { json, rateLimited, readJson } from "@/lib/http";
import { verifyHuman } from "@/lib/turnstile";
import { logActivity } from "@/lib/activity";
import { emailNewWithdrawal } from "@/lib/email";

export async function POST(req: Request) {
  if (rateLimited(req, "withdraw", 6)) return json({ error: "Too many attempts. Please wait a few minutes." }, 429);
  const raw = (await readJson(req)) as Record<string, unknown> | null;
  if (!(await verifyHuman(raw?.turnstile_token, req))) return json({ error: "Please complete the security check and try again." }, 400);
  const parsed = withdrawSchema.safeParse(raw);
  if (!parsed.success) return json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, 400);
  const { website: _hp, ...v } = parsed.data;
  if (!isConfigured) return json({ ok: true, demo: true });

  const supabase = serviceClient();
  // Try to match the story from a pasted link like theforgotten.site/stories/<slug>
  const slug = v.story_reference.match(/stories\/([a-z0-9-]+)/i)?.[1];
  let story_id: string | null = null;
  if (slug) {
    const { data } = await supabase.from("stories").select("id").eq("slug", slug).maybeSingle();
    story_id = data?.id ?? null;
  }

  const { error } = await supabase.from("withdrawal_requests").insert({ ...v, requester_email: v.requester_email.toLowerCase(), story_id });
  if (error) {
    console.error("withdraw", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
  await Promise.all([
    logActivity({ action: "withdrawal.requested", targetType: "withdrawal", targetId: story_id ?? undefined, summary: `${v.requester_name} (${v.relationship}) asked to change or remove: ${v.story_reference.slice(0, 80)}` }),
    emailNewWithdrawal({ story: v.story_reference.slice(0, 80), from: `${v.requester_name} (${v.relationship})` }),
  ]);
  return json({ ok: true });
}
