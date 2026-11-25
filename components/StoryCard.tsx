import Link from "next/link";
import type { PublicStory } from "@/lib/types";
import { fileNo, placeLabel, subjectLabel } from "@/lib/format";

type Tone = "navy" | "burgundy" | "red";

export function Cover({ story, big, tone = "navy" }: { story: PublicStory; big?: boolean; tone?: Tone }) {
  const cover = story.photos?.[0];
  if (cover?.url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="cover" src={cover.url} alt={cover.alt_text ?? ""} loading="lazy" />;
  }
  return (
    <div className={`cover-fallback${tone === "navy" ? "" : ` cover-${tone}`}`} aria-hidden>
      <div className="file"><span>{fileNo(story)}</span><span>{story.region}</span></div>
      {story.pull_quote ? <div className="q">{story.pull_quote}</div> : <span />}
      <div className="who" style={big ? { fontSize: 64 } : undefined}>{story.subject_display_name}</div>
    </div>
  );
}

export default function StoryCard({ story, tone }: { story: PublicStory; tone?: Tone }) {
  return (
    <Link href={`/stories/${story.slug}`} className="story-card">
      <Cover story={story} tone={tone ?? toneFor(story.id)} />
      <div className="body">
        <div className="meta mono">
          <span>{subjectLabel(story)}{story.service_branch ? ` · ${story.service_branch}` : ""}</span>
          <span>{fileNo(story)}</span>
        </div>
        <h3>{story.title}</h3>
        <p>{story.summary}</p>
        <div className="byline mono">{placeLabel(story)} · by {story.contributor_credit}</div>
      </div>
    </Link>
  );
}

/** Rotate cover colors through navy, burgundy and red so the archive grid isn't all one color. */
function toneFor(id: string): Tone {
  const n = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (["navy", "burgundy", "red"] as const)[n % 3];
}
