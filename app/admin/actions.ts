"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireOwner, type AdminUser } from "@/lib/admin";
import { serviceClient, sessionClient } from "@/lib/supabase";
import { slugify } from "@/lib/format";
import { logActivity } from "@/lib/activity";
import { emailStoryPublished } from "@/lib/email";

// Every action re-checks who's signed in. Preview mode is read-only.
async function admin(): Promise<AdminUser> {
  const a = await requireAdmin();
  if (a.demo) redirect("/admin?demo=1");
  return a;
}
async function owner(): Promise<AdminUser> {
  const a = await requireOwner();
  if (a.demo) redirect("/admin?demo=1");
  return a;
}

function refresh(slug?: string | null) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/stories/${slug}`);
}

const back = (formData: FormData, fallback: string) => {
  const to = String(formData.get("back") ?? "");
  return to.startsWith("/admin") ? to : fallback;
};

// ---------- Stories ----------

export async function approveStory(formData: FormData) {
  const me = await admin();
  const id = String(formData.get("id"));
  const sb = serviceClient();
  const { data: s } = await sb
    .from("stories")
    .select("title, slug, published_at, subject_display_name, contributor_email, contributor_name")
    .eq("id", id)
    .single();
  if (!s) return;
  const slug = s.slug ?? `${slugify(s.title)}-${id.slice(0, 6)}`;
  const firstTime = !s.published_at;
  await sb.from("stories").update({
    status: "approved",
    slug,
    published_at: s.published_at ?? new Date().toISOString(),
    withdrawn_at: null,
    reviewed_by: me.id,
    reviewed_at: new Date().toISOString(),
  }).eq("id", id);
  await logActivity({ actor: me, action: "story.approved", targetType: "story", targetId: id, summary: `Approved "${s.title}"` });
  if (firstTime) {
    await emailStoryPublished({ to: s.contributor_email, name: s.contributor_name.split(" ")[0], subject: s.subject_display_name, slug });
  }
  refresh(slug);
  redirect(back(formData, `/admin/stories/${id}?saved=approved`));
}

const STATUS_WORDS: Record<string, string> = { pending: "Moved back to review", rejected: "Did not publish", withdrawn: "Withdrew" };

export async function setStatus(formData: FormData) {
  const me = await admin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["pending", "rejected", "withdrawn"].includes(status)) return;
  const sb = serviceClient();
  const { data: s } = await sb.from("stories").select("slug, title").eq("id", id).single();
  await sb.from("stories").update({
    status,
    featured: false,
    withdrawn_at: status === "withdrawn" ? new Date().toISOString() : null,
    reviewed_by: me.id,
    reviewed_at: new Date().toISOString(),
  }).eq("id", id);
  await logActivity({ actor: me, action: `story.${status}`, targetType: "story", targetId: id, summary: `${STATUS_WORDS[status]} "${s?.title ?? id}"` });
  refresh(s?.slug);
  redirect(back(formData, `/admin/stories/${id}?saved=${status}`));
}

export async function toggleFeatured(formData: FormData) {
  const me = await admin();
  const id = String(formData.get("id"));
  const sb = serviceClient();
  const { data: s } = await sb.from("stories").select("featured, slug, status, title").eq("id", id).single();
  if (!s || s.status !== "approved") return;
  await sb.from("stories").update({ featured: !s.featured }).eq("id", id);
  await logActivity({ actor: me, action: s.featured ? "story.unfeatured" : "story.featured", targetType: "story", targetId: id, summary: `${s.featured ? "Removed from" : "Featured on"} homepage: "${s.title}"` });
  refresh(s.slug);
  redirect(back(formData, `/admin/stories/${id}`));
}

export async function updateStory(formData: FormData) {
  const me = await admin();
  const id = String(formData.get("id"));
  const str = (k: string) => String(formData.get(k) ?? "").trim();
  const opt = (k: string) => str(k) || null;
  const update = {
    title: str("title"),
    summary: str("summary"),
    body: str("body"),
    pull_quote: opt("pull_quote"),
    subject_display_name: str("subject_display_name"),
    contributor_credit: str("contributor_credit"),
    city: opt("city"),
    region: str("region"),
    themes: formData.getAll("themes").map(String).slice(0, 5),
    reviewer_notes: opt("reviewer_notes"),
  };
  const sb = serviceClient();
  const { error } = await sb.from("stories").update(update).eq("id", id);
  const { data: s } = await sb.from("stories").select("slug").eq("id", id).single();
  if (!error) await logActivity({ actor: me, action: "story.edited", targetType: "story", targetId: id, summary: `Edited "${update.title}"` });
  refresh(s?.slug);
  redirect(`/admin/stories/${id}?${error ? "error=" + encodeURIComponent(error.message) : "saved=1"}`);
}

export async function deleteStory(formData: FormData) {
  const me = await owner(); // permanent deletion is owner-only
  const id = String(formData.get("id"));
  if (formData.get("confirm") !== "DELETE") redirect(`/admin/stories/${id}?error=${encodeURIComponent("Type DELETE to confirm")}`);
  const sb = serviceClient();
  const { data: s } = await sb.from("stories").select("slug, title, consent_file_path").eq("id", id).single();
  const { data: photos } = await sb.from("story_photos").select("storage_path").eq("story_id", id);
  if (photos?.length) await sb.storage.from("story-photos").remove(photos.map((p) => p.storage_path));
  if (s?.consent_file_path) await sb.storage.from("consent-forms").remove([s.consent_file_path]);
  await sb.from("stories").delete().eq("id", id);
  await logActivity({ actor: me, action: "story.deleted", targetType: "story", targetId: id, summary: `Permanently deleted "${s?.title ?? id}"` });
  refresh(s?.slug);
  redirect("/admin/review?deleted=1");
}

// ---------- Inbox ----------

export async function markSignupHandled(formData: FormData) {
  await owner();
  await serviceClient().from("contributor_signups").update({ handled: formData.get("handled") === "1" }).eq("id", String(formData.get("id")));
  revalidatePath("/admin", "layout");
}

export async function resolveWithdrawal(formData: FormData) {
  const me = await admin();
  const status = String(formData.get("status"));
  if (!["open", "done", "declined"].includes(status)) return;
  const id = String(formData.get("id"));
  await serviceClient().from("withdrawal_requests").update({ status, resolved_at: status === "open" ? null : new Date().toISOString() }).eq("id", id);
  await logActivity({ actor: me, action: `withdrawal.${status}`, targetType: "withdrawal", targetId: id, summary: `Marked a withdrawal request ${status}` });
  revalidatePath("/admin", "layout");
}

// ---------- Team (owner only) ----------

export async function inviteMember(formData: FormData) {
  const me = await owner();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = formData.get("role") === "owner" ? "owner" : "reviewer";
  const name = String(formData.get("display_name") ?? "").trim() || null;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect(`/admin/team?error=${encodeURIComponent("Enter a valid email")}`);

  const sb = serviceClient();
  // Create their account (already confirmed) so they can sign in at /admin/login
  // with a one-time email link. If they already have an account, look it up.
  let userId: string | null = null;
  const created = await sb.auth.admin.createUser({ email, email_confirm: true });
  if (created.data?.user) userId = created.data.user.id;
  else {
    const { data } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userId = data?.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
  }
  if (!userId) redirect(`/admin/team?error=${encodeURIComponent(created.error?.message ?? "Couldn't add that address")}`);

  const { error } = await sb.from("admins").upsert({ user_id: userId, email, role, display_name: name });
  if (error) redirect(`/admin/team?error=${encodeURIComponent(error.message)}`);
  await logActivity({ actor: me, action: "team.invited", targetType: "admin", targetId: userId!, summary: `Added ${email} as ${role}` });
  revalidatePath("/admin", "layout");
  redirect("/admin/team?saved=invited");
}

export async function changeRole(formData: FormData) {
  const me = await owner();
  const userId = String(formData.get("user_id"));
  const role = formData.get("role") === "owner" ? "owner" : "reviewer";
  if (userId === me.id && role !== "owner") redirect(`/admin/team?error=${encodeURIComponent("You can't remove your own owner access")}`);
  const sb = serviceClient();
  await sb.from("admins").update({ role }).eq("user_id", userId);
  const { data } = await sb.from("admins").select("email").eq("user_id", userId).single();
  await logActivity({ actor: me, action: "team.role", targetType: "admin", targetId: userId, summary: `Changed ${data?.email ?? userId} to ${role}` });
  revalidatePath("/admin", "layout");
  redirect("/admin/team?saved=role");
}

export async function removeMember(formData: FormData) {
  const me = await owner();
  const userId = String(formData.get("user_id"));
  if (userId === me.id) redirect(`/admin/team?error=${encodeURIComponent("You can't remove yourself")}`);
  const sb = serviceClient();
  const { data } = await sb.from("admins").select("email").eq("user_id", userId).single();
  await sb.from("admins").delete().eq("user_id", userId);
  await logActivity({ actor: me, action: "team.removed", targetType: "admin", targetId: userId, summary: `Removed ${data?.email ?? userId} from the team` });
  revalidatePath("/admin", "layout");
  redirect("/admin/team?saved=removed");
}

export async function signOut() {
  const sb = await sessionClient();
  await sb.auth.signOut();
  redirect("/admin/login");
}
