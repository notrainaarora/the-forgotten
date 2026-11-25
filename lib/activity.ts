import "server-only";
import { isConfigured, serviceClient } from "./supabase";

/** Record something that happened, for the owner's activity feed. Never throws. */
export async function logActivity(entry: {
  actor?: { id: string; email: string } | null;
  action: string;
  targetType?: string;
  targetId?: string;
  summary: string;
}) {
  if (!isConfigured) return;
  try {
    await serviceClient().from("activity_log").insert({
      actor_id: entry.actor?.id && entry.actor.id !== "demo" ? entry.actor.id : null,
      actor_email: entry.actor?.email ?? null,
      action: entry.action,
      target_type: entry.targetType ?? null,
      target_id: entry.targetId ?? null,
      summary: entry.summary,
    });
  } catch (e) {
    console.error("logActivity", e);
  }
}
