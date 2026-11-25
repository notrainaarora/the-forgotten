import { fieldErrors, signupSchema } from "@/lib/validation";
import { isConfigured, serviceClient } from "@/lib/supabase";
import { json, rateLimited, readJson } from "@/lib/http";
import { verifyHuman } from "@/lib/turnstile";
import { logActivity } from "@/lib/activity";
import { emailWelcomeContributor } from "@/lib/email";

export async function POST(req: Request) {
  if (rateLimited(req, "signup", 6)) return json({ error: "Too many attempts. Please wait a few minutes." }, 429);
  const raw = (await readJson(req)) as Record<string, unknown> | null;
  if (!(await verifyHuman(raw?.turnstile_token, req))) return json({ error: "Please complete the security check and try again." }, 400);
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) return json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, 400);
  const { website: _hp, age_13_plus: _a, ...v } = parsed.data;
  if (!isConfigured) return json({ ok: true, demo: true });

  const { error } = await serviceClient().from("contributor_signups").insert({
    ...v,
    email: v.email.toLowerCase(),
    guardian_email: v.age_group === "13-17" ? v.guardian_email : null,
  });
  if (error) {
    console.error("signup", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
  await Promise.all([
    logActivity({ action: "signup.created", targetType: "signup", summary: `${v.name} signed up as a contributor${v.school ? ` (${v.school})` : ""}` }),
    emailWelcomeContributor({ to: v.email, guardian: v.age_group === "13-17" ? v.guardian_email : null, name: v.name.split(" ")[0] }),
  ]);
  return json({ ok: true });
}
