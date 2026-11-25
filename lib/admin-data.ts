import "server-only";
import { isConfigured, serviceClient } from "./supabase";
import { DEMO_ACTIVITY, DEMO_ADMIN_STORIES, DEMO_SIGNUPS, DEMO_TEAM, DEMO_WITHDRAWALS } from "./demo";
import type { AdminStory, StoryStatus } from "./types";

// All admin reads use the service key and are only called after requireAdmin()/requireOwner().

export type Signup = (typeof DEMO_SIGNUPS)[number];
export type Withdrawal = (typeof DEMO_WITHDRAWALS)[number];
export type Activity = { id: number; actor_email: string | null; action: string; summary: string | null; created_at: string };
export type TeamMember = { user_id: string; email: string; role: string; display_name: string | null; created_at: string };

const LIST_COLS =
  "id, slug, status, featured, title, subject_display_name, subject_type, region, country, themes, contributor_name, contributor_email, contributor_school, contributor_age_group, consent_book, created_at, published_at";

export async function listAdminStories(status: StoryStatus | "all", q?: string) {
  let rows: AdminStory[];
  if (!isConfigured) rows = DEMO_ADMIN_STORIES.filter((s) => status === "all" || s.status === status);
  else {
    let query = serviceClient().from("stories").select(LIST_COLS).order("created_at", { ascending: status === "pending" }).limit(500);
    if (status !== "all") query = query.eq("status", status);
    const { data } = await query;
    rows = (data ?? []) as unknown as AdminStory[];
  }
  if (q) {
    const t = q.toLowerCase();
    rows = rows.filter((s) => [s.title, s.subject_display_name, s.contributor_name, s.contributor_email, s.region].some((v) => v?.toLowerCase().includes(t)));
  }
  return rows;
}

export async function statusCounts() {
  const counts = { pending: 0, approved: 0, rejected: 0, withdrawn: 0, signups: 0, withdrawals: 0 };
  if (!isConfigured) {
    for (const s of DEMO_ADMIN_STORIES) counts[s.status]++;
    counts.signups = DEMO_SIGNUPS.filter((s) => !s.handled).length;
    counts.withdrawals = DEMO_WITHDRAWALS.filter((w) => w.status === "open").length;
    return counts;
  }
  const sb = serviceClient();
  const head = { count: "exact" as const, head: true };
  const [p, a, r, w, su, wd] = await Promise.all([
    sb.from("stories").select("id", head).eq("status", "pending"),
    sb.from("stories").select("id", head).eq("status", "approved"),
    sb.from("stories").select("id", head).eq("status", "rejected"),
    sb.from("stories").select("id", head).eq("status", "withdrawn"),
    sb.from("contributor_signups").select("id", head).eq("handled", false),
    sb.from("withdrawal_requests").select("id", head).eq("status", "open"),
  ]);
  return { pending: p.count ?? 0, approved: a.count ?? 0, rejected: r.count ?? 0, withdrawn: w.count ?? 0, signups: su.count ?? 0, withdrawals: wd.count ?? 0 };
}

/** Everything the overview page shows, computed from lightweight columns. */
export async function getOverview() {
  const stories = await listAdminStories("all");
  const [signups, activity] = await Promise.all([listSignups(), listActivity(12)]);
  const published = stories.filter((s) => s.status === "approved");

  // Submissions per week, last 12 weeks
  const weeks: { label: string; count: number }[] = [];
  const now = new Date();
  const startOfWeek = (d: Date) => { const x = new Date(d); x.setUTCHours(0, 0, 0, 0); x.setUTCDate(x.getUTCDate() - x.getUTCDay()); return x; };
  const thisWeek = startOfWeek(now);
  for (let i = 11; i >= 0; i--) {
    const w = new Date(thisWeek); w.setUTCDate(w.getUTCDate() - i * 7);
    weeks.push({ label: w.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), count: 0 });
  }
  for (const s of stories) {
    const diff = Math.floor((thisWeek.getTime() - startOfWeek(new Date(s.created_at)).getTime()) / (7 * 86400000));
    if (diff >= 0 && diff < 12) weeks[11 - diff].count++;
  }

  const tally = (values: string[]) => {
    const m = new Map<string, number>();
    values.forEach((v) => m.set(v, (m.get(v) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const pending = stories.filter((s) => s.status === "pending");
  const oldestPendingDays = pending.length
    ? Math.floor((Date.now() - Math.min(...pending.map((s) => new Date(s.created_at).getTime()))) / 86400000)
    : 0;
  const contributorEmails = new Set([...stories.map((s) => s.contributor_email?.toLowerCase()), ...signups.map((s) => s.email.toLowerCase())].filter(Boolean));
  const schools = new Set([...stories.map((s) => s.contributor_school), ...signups.map((s) => s.school)].filter(Boolean));

  return {
    totals: {
      stories: stories.length,
      published: published.length,
      pending: pending.length,
      contributors: contributorEmails.size,
      schools: schools.size,
      states: new Set(published.map((s) => s.region)).size,
      bookReady: published.filter((s) => s.consent_book).length,
    },
    oldestPendingDays,
    weeks,
    bySubject: tally(published.map((s) => s.subject_type)),
    byRegion: tally(published.map((s) => s.region)).slice(0, 8),
    byTheme: tally(published.flatMap((s) => s.themes ?? [])).slice(0, 8),
    activity,
  };
}

export async function getAdminStory(id: string) {
  if (!isConfigured) {
    const story = DEMO_ADMIN_STORIES.find((s) => s.id === id) ?? null;
    return story ? { story, consentUrl: null as string | null, photos: [] as { id: string; url: string | null; caption: string | null; alt_text: string | null }[] } : null;
  }
  const sb = serviceClient();
  const { data: story } = await sb.from("stories").select("*").eq("id", id).maybeSingle();
  if (!story) return null;
  const { data: consent } = await sb.storage.from("consent-forms").createSignedUrl(story.consent_file_path, 60 * 15);
  const { data: photoRows } = await sb.from("story_photos").select("id, storage_path, caption, alt_text").eq("story_id", id).order("sort_order");
  const signed = photoRows?.length
    ? (await sb.storage.from("story-photos").createSignedUrls(photoRows.map((p) => p.storage_path), 60 * 15)).data ?? []
    : [];
  const urlByPath = new Map(signed.map((s) => [s.path, s.signedUrl]));
  return {
    story: story as AdminStory,
    consentUrl: consent?.signedUrl ?? null,
    photos: (photoRows ?? []).map((p) => ({ id: p.id, url: urlByPath.get(p.storage_path) ?? null, caption: p.caption, alt_text: p.alt_text })),
  };
}

export async function listSignups(): Promise<Signup[]> {
  if (!isConfigured) return DEMO_SIGNUPS;
  const { data } = await serviceClient().from("contributor_signups").select("*").order("created_at", { ascending: false }).limit(1000);
  return (data ?? []) as Signup[];
}

export async function listWithdrawals(): Promise<Withdrawal[]> {
  if (!isConfigured) return DEMO_WITHDRAWALS;
  const { data } = await serviceClient()
    .from("withdrawal_requests")
    .select("*, stories(id, title, slug, status)")
    .order("created_at", { ascending: false })
    .limit(500);
  return (data ?? []) as Withdrawal[];
}

export async function listActivity(limit = 100): Promise<Activity[]> {
  if (!isConfigured) return DEMO_ACTIVITY.slice(0, limit);
  const { data } = await serviceClient().from("activity_log").select("id, actor_email, action, summary, created_at").order("created_at", { ascending: false }).limit(limit);
  return (data ?? []) as Activity[];
}

export async function listTeam(): Promise<TeamMember[]> {
  if (!isConfigured) return DEMO_TEAM;
  const { data } = await serviceClient().from("admins").select("user_id, email, role, display_name, created_at").order("created_at");
  return (data ?? []) as TeamMember[];
}

/** One row per contributor (by email), combining their stories and their sign-up. */
export async function listContributors() {
  const [stories, signups] = await Promise.all([listAdminStories("all"), listSignups()]);
  const map = new Map<string, { email: string; name: string; school: string | null; age: string | null; region: string | null; total: number; published: number; pending: number; signedUp: string | null; last: string }>();
  const key = (e: string) => e.toLowerCase();
  for (const s of signups) {
    map.set(key(s.email), { email: s.email, name: s.name, school: s.school, age: s.age_group, region: s.region, total: 0, published: 0, pending: 0, signedUp: s.created_at, last: s.created_at });
  }
  for (const s of stories) {
    if (!s.contributor_email) continue;
    const k = key(s.contributor_email);
    const row = map.get(k) ?? { email: s.contributor_email, name: s.contributor_name, school: s.contributor_school, age: s.contributor_age_group, region: s.region, total: 0, published: 0, pending: 0, signedUp: null, last: s.created_at };
    row.total++;
    if (s.status === "approved") row.published++;
    if (s.status === "pending") row.pending++;
    if (s.created_at > row.last) row.last = s.created_at;
    row.school ??= s.contributor_school;
    map.set(k, row);
  }
  return [...map.values()].sort((a, b) => b.last.localeCompare(a.last));
}
