import "server-only";
import { redirect } from "next/navigation";
import { isConfigured, serviceClient, sessionClient } from "./supabase";

export type AdminRole = "owner" | "reviewer";
export interface AdminUser { id: string; email: string; role: AdminRole; name: string | null; demo: boolean }

/** The signed-in team member, or null. In preview mode everyone is a read-only demo owner. */
export async function getAdmin(): Promise<AdminUser | null> {
  if (!isConfigured) return { id: "demo", email: "owner@theforgotten.site", role: "owner", name: "Demo owner", demo: true };
  const supabase = await sessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await serviceClient().from("admins").select("role, display_name").eq("user_id", user.id).maybeSingle();
  if (!data) return null;
  return { id: user.id, email: user.email ?? "", role: data.role as AdminRole, name: data.display_name, demo: false };
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Owner-only pages and actions. Reviewers are sent back to the overview. */
export async function requireOwner(): Promise<AdminUser> {
  const admin = await requireAdmin();
  if (admin.role !== "owner") redirect("/admin?denied=1");
  return admin;
}
