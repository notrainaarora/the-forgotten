import { getAdmin } from "@/lib/admin";
import { isConfigured, serviceClient } from "@/lib/supabase";
import { listActivity, listAdminStories, listContributors, listSignups, listWithdrawals } from "@/lib/admin-data";
import { DEMO_ADMIN_STORIES } from "@/lib/demo";
import { logActivity } from "@/lib/activity";

// Owner-only CSV downloads.
function csv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    let s = v == null ? "" : Array.isArray(v) ? v.join("; ") : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => cell(r[h])).join(","))].join("\r\n");
}

export async function GET(_req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const me = await getAdmin();
  if (!me || me.role !== "owner") return new Response("Not allowed", { status: 403 });
  const { kind } = await params;
  let rows: Record<string, unknown>[] = [];

  if (kind === "stories") {
    rows = (await listAdminStories("all")).map((s) => ({
      title: s.title, status: s.status, person: s.subject_display_name, who: s.subject_type, region: s.region, country: s.country,
      themes: s.themes, contributor: s.contributor_name, contributor_email: s.contributor_email, school: s.contributor_school,
      age_group: s.contributor_age_group, book_consent: s.consent_book, submitted: s.created_at, published: s.published_at,
      link: s.slug && s.status === "approved" ? `/stories/${s.slug}` : "",
    }));
  } else if (kind === "book") {
    const data = isConfigured
      ? (await serviceClient().from("stories").select("title, subject_display_name, subject_type, service_branch, service_era, region, summary, body, pull_quote, contributor_credit, published_at").eq("status", "approved").eq("consent_book", true).order("published_at")).data ?? []
      : DEMO_ADMIN_STORIES.filter((s) => s.status === "approved" && s.consent_book);
    rows = data.map((s) => ({ title: s.title, person: s.subject_display_name, who: s.subject_type, branch: s.service_branch, era: s.service_era, region: s.region, summary: s.summary, pull_quote: s.pull_quote, story: s.body, credit: s.contributor_credit, published: s.published_at }));
  } else if (kind === "contributors") {
    rows = (await listContributors()).map((c) => ({ name: c.name, email: c.email, school: c.school, age_group: c.age, region: c.region, stories_submitted: c.total, published: c.published, waiting: c.pending, signed_up: c.signedUp, last_active: c.last }));
  } else if (kind === "signups") {
    rows = (await listSignups()).map((s) => ({ name: s.name, email: s.email, age_group: s.age_group, guardian_email: s.guardian_email, school: s.school, city: s.city, region: s.region, interests: s.interests, message: s.message, contacted: s.handled, signed_up: s.created_at }));
  } else if (kind === "withdrawals") {
    rows = (await listWithdrawals()).map((w) => ({ story: w.stories?.title ?? w.story_reference, requester: w.requester_name, email: w.requester_email, relationship: w.relationship, request: w.reason, status: w.status, received: w.created_at, resolved: w.resolved_at }));
  } else if (kind === "activity") {
    rows = (await listActivity(5000)).map((a) => ({ when: a.created_at, action: a.action, summary: a.summary, by: a.actor_email }));
  } else {
    return new Response("Unknown export", { status: 404 });
  }

  if (!me.demo) await logActivity({ actor: me, action: "export.downloaded", summary: `Downloaded ${kind} spreadsheet (${rows.length} rows)` });
  const date = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + (csv(rows) || "No data yet\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="the-forgotten-${kind}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
