import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { isConfigured } from "@/lib/supabase";
import { getAdmin } from "@/lib/admin";
import { LogoMark } from "@/components/Logo";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

async function sendLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !isConfigured) redirect("/admin/login?sent=1");
  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `https://${h.get("host")}`;
  // Implicit flow: the emailed link carries the session itself, so it works in any
  // browser (see /auth/finish). shouldCreateUser:false → only team members can sign in.
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false },
  });
  await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/finish` } });
  // Same message whether or not the address is an admin, so we don't reveal who is.
  redirect("/admin/login?sent=1");
}

type SP = Promise<{ sent?: string; error?: string }>;

export default async function Login({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const admin = await getAdmin();
  if (admin && !admin.demo) redirect("/admin");

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand"><LogoMark size={30} /> The Forgotten</div>
        <h2 style={{ fontFamily: "var(--display)", fontWeight: 400, textTransform: "uppercase", fontSize: 40, lineHeight: 1, color: "var(--burgundy)", margin: "0 0 10px" }}>Team sign in</h2>
        {!isConfigured && <div className="notice notice-warn">Preview mode: <a href="/admin">open the demo dashboard</a>.</div>}
        {sp.sent ? (
          <div className="notice notice-ok">If that address belongs to a team member, a sign-in link is on its way. Check your inbox.</div>
        ) : (
          <>
            {sp.error && <div className="notice notice-err">That link expired or was already used. Request a new one.</div>}
            <p className="muted">We&rsquo;ll email you a one-time sign-in link. No password needed.</p>
            <form action={sendLink}>
              <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
              <button className="btn btn-primary" type="submit">Email me a link</button>
            </form>
          </>
        )}
        <p className="mono" style={{ marginTop: 24, fontSize: 11 }}><a href="/">← Back to the site</a></p>
      </div>
    </div>
  );
}
