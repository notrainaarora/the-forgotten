import type { Metadata } from "next";
import Link from "next/link";
import StoryCard from "@/components/StoryCard";
import { getRegionsInUse, getStats, getThemes, listStories } from "@/lib/data";
import { SUBJECT_TYPES } from "@/lib/constants";

export const metadata: Metadata = { title: "The Archive", description: "Personal stories of veterans, seniors, and others too often overlooked, gathered by teen contributors." };
export const revalidate = 600;

const PER_PAGE = 24;
type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function StoriesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const filters = { subject: one(sp.subject), theme: one(sp.theme), region: one(sp.region), q: one(sp.q) };
  const sort = one(sp.sort) === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const [found, themes, regions, stats] = await Promise.all([
    listStories(filters, PER_PAGE + 1, { offset: (page - 1) * PER_PAGE, sort }),
    getThemes(),
    getRegionsInUse(),
    getStats(),
  ]);
  const hasMore = found.length > PER_PAGE;
  const stories = found.slice(0, PER_PAGE);
  const active = Object.values(filters).some(Boolean);

  // Build a link that keeps the current filters but changes one thing.
  const href = (change: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const next = { ...filters, sort: sort === "newest" ? undefined : sort, ...change };
    Object.entries(next).forEach(([k, v]) => v && params.set(k, v));
    const qs = params.toString();
    return `/stories${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <p className="eyebrow">Phase 01 · The story database</p>
          <h1>The Archive</h1>
          <p>
            {stats.stories > 0
              ? `${stats.stories} ${stats.stories === 1 ? "story" : "stories"} from ${stats.regions} ${stats.regions === 1 ? "state" : "states"}, gathered by teen contributors and shared with written permission.`
              : "Personal stories gathered by teen contributors, each shared with written permission."}
          </p>
        </div>
      </div>
      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="chips" style={{ marginBottom: 16 }}>
            <Link href={href({ subject: undefined, page: undefined })} className={`chip${!filters.subject ? " on" : ""}`} style={{ textDecoration: "none" }}>Everyone</Link>
            {SUBJECT_TYPES.map((t) => (
              <Link key={t.value} href={href({ subject: t.value, page: undefined })} className={`chip${filters.subject === t.value ? " on" : ""}`} style={{ textDecoration: "none" }}>{t.label}s</Link>
            ))}
          </div>

          <form className="filters" method="get" role="search">
            {filters.subject && <input type="hidden" name="subject" value={filters.subject} />}
            <div className="filter-q">
              <label htmlFor="q">Search</label>
              <input id="q" name="q" type="search" defaultValue={filters.q} placeholder="Name, title, or words in the story" />
            </div>
            <div>
              <label htmlFor="theme">Theme</label>
              <select id="theme" name="theme" defaultValue={filters.theme ?? ""}>
                <option value="">All themes</option>
                {themes.map((t) => <option key={t.slug} value={t.slug}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="region">Region</label>
              <select id="region" name="region" defaultValue={filters.region ?? ""}>
                <option value="">Everywhere</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="sort">Sort</label>
              <select id="sort" name="sort" defaultValue={sort}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
            <button className="btn btn-dark" type="submit">Search</button>
          </form>

          <div className="results-bar">
            <span>
              {page > 1 ? `Page ${page} · ` : ""}{String(stories.length).padStart(3, "0")} {stories.length === 1 ? "record" : "records"}
              {active ? " · filtered" : ""}
            </span>
            {active && <Link href="/stories">Clear filters ×</Link>}
          </div>

          {stories.length ? (
            <div className="grid-stories">{stories.map((s) => <StoryCard key={s.id} story={s} />)}</div>
          ) : (
            <div className="empty">
              {active ? "No stories match those filters yet." : "The first stories are on their way."}{" "}
              <Link href="/share">Share one?</Link>
            </div>
          )}

          {(page > 1 || hasMore) && (
            <div className="hero-actions" style={{ justifyContent: "center", marginTop: 48 }}>
              {page > 1 && <Link className="btn btn-outline" href={href({ page: page - 1 > 1 ? String(page - 1) : undefined })}>← Newer</Link>}
              {hasMore && <Link className="btn btn-dark" href={href({ page: String(page + 1) })}>More stories →</Link>}
            </div>
          )}

          <div style={{ marginTop: 64, borderTop: "1px solid var(--line-strong)", paddingTop: 24 }}>
            <p className="section-label">Browse by theme</p>
            <div className="tags">
              {themes.map((t) => (
                <Link key={t.slug} href={href({ theme: t.slug, page: undefined })} className={`tag${filters.theme === t.slug ? " tag-dark" : ""}`}>{t.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
