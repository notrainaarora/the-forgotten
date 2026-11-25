import "server-only";
import { isConfigured, publicClient, serviceClient } from "@/lib/supabase";
import { DEMO_STORIES } from "@/lib/demo";
import { DEFAULT_THEMES } from "@/lib/constants";
import type { Photo, PublicStory, StoryFilters } from "@/lib/types";

const PUBLIC_COLUMNS =
  "id, slug, featured, title, summary, body, pull_quote, format, themes, subject_display_name, subject_type, subject_type_other, service_branch, service_era, city, region, country, contributor_credit, contributor_school, consent_photos, published_at";

function matches(s: PublicStory, f: StoryFilters) {
  if (f.subject && s.subject_type !== f.subject) return false;
  if (f.theme && !s.themes.includes(f.theme)) return false;
  if (f.region && s.region !== f.region) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    if (![s.title, s.summary, s.body, s.subject_display_name].some((t) => t.toLowerCase().includes(q))) return false;
  }
  return true;
}

export async function getThemes(): Promise<{ slug: string; label: string }[]> {
  if (!isConfigured) return DEFAULT_THEMES;
  const { data, error } = await publicClient().from("themes").select("slug, label").order("sort_order");
  if (error || !data) return DEFAULT_THEMES;
  return data;
}

export async function listStories(
  filters: StoryFilters = {},
  limit = 60,
  opts: { offset?: number; sort?: "newest" | "oldest" } = {}
): Promise<PublicStory[]> {
  const offset = opts.offset ?? 0;
  const ascending = opts.sort === "oldest";
  if (!isConfigured) {
    const rows = DEMO_STORIES.filter((s) => matches(s, filters));
    if (ascending) rows.reverse();
    return rows.slice(offset, offset + limit);
  }

  let query = publicClient()
    .from("published_stories")
    .select(PUBLIC_COLUMNS)
    .order("published_at", { ascending })
    .range(offset, offset + limit - 1);
  if (filters.subject) query = query.eq("subject_type", filters.subject);
  if (filters.theme) query = query.contains("themes", [filters.theme]);
  if (filters.region) query = query.eq("region", filters.region);
  if (filters.q) {
    // Strip characters that have meaning in PostgREST filter syntax.
    const q = filters.q.replace(/[%,()*\\]/g, " ").trim().slice(0, 80);
    if (q) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%,subject_display_name.ilike.%${q}%`);
  }
  const { data, error } = await query;
  if (error) {
    console.error("listStories", error);
    return [];
  }
  const stories = (data ?? []) as PublicStory[];
  await attachCoverPhotos(stories);
  return stories;
}

export async function listFeatured(limit = 3): Promise<PublicStory[]> {
  if (!isConfigured) return [...DEMO_STORIES].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, limit);
  const { data } = await publicClient()
    .from("published_stories")
    .select(PUBLIC_COLUMNS)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);
  const stories = (data ?? []) as PublicStory[];
  await attachCoverPhotos(stories);
  return stories;
}

export async function getStory(slug: string): Promise<PublicStory | null> {
  if (!isConfigured) return DEMO_STORIES.find((s) => s.slug === slug) ?? null;
  const { data } = await publicClient().from("published_stories").select(PUBLIC_COLUMNS).eq("slug", slug).maybeSingle();
  if (!data) return null;
  const story = data as PublicStory;
  story.photos = await photosFor([story.id]).then((m) => m.get(story.id) ?? []);
  return story;
}

export async function getRegionsInUse(): Promise<string[]> {
  if (!isConfigured) return [...new Set(DEMO_STORIES.map((s) => s.region))].sort();
  const { data } = await publicClient().from("published_stories").select("region");
  return [...new Set((data ?? []).map((r: { region: string }) => r.region))].sort();
}

export async function getStats() {
  if (!isConfigured) return { stories: DEMO_STORIES.length, regions: new Set(DEMO_STORIES.map((s) => s.region)).size };
  const { data } = await publicClient().from("published_stories").select("region");
  const rows = data ?? [];
  return { stories: rows.length, regions: new Set(rows.map((r: { region: string }) => r.region)).size };
}

// ---------- Photos ----------
// Photos live in a private bucket. We only look them up through the
// published_photos view (approved stories whose subject agreed to photos),
// then sign short-lived links with the service key.

async function photosFor(storyIds: string[]): Promise<Map<string, Photo[]>> {
  const result = new Map<string, Photo[]>();
  if (!isConfigured || storyIds.length === 0) return result;
  const { data } = await publicClient()
    .from("published_photos")
    .select("id, story_id, storage_path, caption, alt_text, sort_order")
    .in("story_id", storyIds)
    .order("sort_order");
  if (!data?.length) return result;

  const { data: signed } = await serviceClient()
    .storage.from("story-photos")
    .createSignedUrls(data.map((p) => p.storage_path), 60 * 60 * 2);
  const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

  for (const p of data) {
    const list = result.get(p.story_id) ?? [];
    list.push({ id: p.id, url: urlByPath.get(p.storage_path) ?? null, caption: p.caption, alt_text: p.alt_text });
    result.set(p.story_id, list);
  }
  return result;
}

async function attachCoverPhotos(stories: PublicStory[]) {
  const map = await photosFor(stories.filter((s) => s.consent_photos).map((s) => s.id));
  for (const s of stories) s.photos = (map.get(s.id) ?? []).slice(0, 1);
}
