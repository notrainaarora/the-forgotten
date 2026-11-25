import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStory, getThemes } from "@/lib/data";
import { fileNo, formatDate, placeLabel, renderBody, subjectLabel } from "@/lib/format";
import { FORMATS } from "@/lib/constants";

export const revalidate = 600;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const story = await getStory((await params).slug);
  if (!story) return { title: "Story not found" };
  return { title: story.title, description: story.summary, openGraph: { title: story.title, description: story.summary } };
}

export default async function StoryPage({ params }: { params: Params }) {
  const story = await getStory((await params).slug);
  if (!story) notFound();
  const themes = await getThemes();
  const themeLabel = (slug: string) => themes.find((t) => t.slug === slug)?.label ?? slug;
  const photos = story.photos ?? [];
  const paragraphs = renderBody(story.body) as React.ReactNode[];
  const mid = Math.min(2, paragraphs.length);
  const format = FORMATS.find((f) => f.value === story.format)?.label;

  return (
    <article>
      <header className="story-head">
        <div className="wrap">
          <div className="file-line mono">
            <b>File {fileNo(story)}</b>
            <span>{subjectLabel(story)}</span>
            <span>{format}</span>
            <span>{placeLabel(story)}</span>
            {story.published_at && <span>{formatDate(story.published_at)}</span>}
          </div>
          <h1>{story.title}</h1>
          <p className="summary">{story.summary}</p>
        </div>
        {photos[0]?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="story-hero-img" src={photos[0].url} alt={photos[0].alt_text ?? ""} />
        )}
      </header>

      <div className="wrap">
        <div className="story-layout">
          <aside className="record" aria-label="Story record">
            <div className="record-title">Record</div>
            <dl>
              <dt>Name</dt><dd>{story.subject_display_name}</dd>
              <dt>Who</dt><dd>{subjectLabel(story)}</dd>
              {story.service_branch && (<><dt>Branch</dt><dd>{story.service_branch}</dd></>)}
              {story.service_era && (<><dt>Era</dt><dd>{story.service_era}</dd></>)}
              <dt>Place</dt><dd>{placeLabel(story)}</dd>
              <dt>Recorded by</dt><dd>{story.contributor_credit}{story.contributor_school ? `, ${story.contributor_school}` : ""}</dd>
              <dt>Format</dt><dd>{format}</dd>
            </dl>
            {story.themes.length > 0 && (
              <div className="tags">
                {story.themes.map((t) => (
                  <Link key={t} className="tag" href={`/stories?theme=${encodeURIComponent(t)}`}>{themeLabel(t)}</Link>
                ))}
              </div>
            )}
          </aside>

          <div className="story-body">
            {paragraphs.slice(0, mid)}
            {story.pull_quote && <blockquote className="pull-quote">{story.pull_quote}</blockquote>}
            {paragraphs.slice(mid)}
            {photos.slice(1).map((p) => p.url && (
              <figure key={p.id} className="photo-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.alt_text ?? ""} />
                {p.caption && <figcaption>{p.caption}</figcaption>}
              </figure>
            ))}
            {photos[0]?.caption && <p className="mono muted" style={{ fontSize: 12 }}>Top photo: {photos[0].caption}</p>}

            <div className="story-foot">
              Shared with {story.subject_display_name}&rsquo;s written permission. Is this your story or a loved one&rsquo;s?{" "}
              <Link href="/withdraw">Request changes or removal</Link>.
            </div>

            <div className="help-box">
              <h3>Moved by this story?</h3>
              <p style={{ margin: "0 0 18px" }}>
                Find organizations supporting {story.subject_type === "senior" ? "older adults" : "veterans and others"} in your
                community, or document a story from your own.
              </p>
              <div className="hero-actions">
                <Link href="/get-involved#resources" className="btn btn-primary btn-small arrow">Ways to help</Link>
                <Link href="/share" className="btn btn-outline btn-small">Share a story</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
