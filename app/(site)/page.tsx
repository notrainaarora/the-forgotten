import Link from "next/link";
import StoryCard, { Cover } from "@/components/StoryCard";
import { listFeatured } from "@/lib/data";
import { fileNo, placeLabel, subjectLabel } from "@/lib/format";
import { Flag, LogoMark } from "@/components/Logo";

export const revalidate = 600;

const MARQUEE = ["Listen", "Document", "Share", "Dignity first", "Consent always", "Youth-powered"];

export default async function Home() {
  const featured = await listFeatured(4);
  const [lead, ...rest] = featured;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <div className="hero-meta mono">
            <span>A youth-led archive</span>
            <span>Stories · Advocacy · Giving</span>
            <span>Veterans · Seniors · Neighbors</span>
            <span className="flag-mini"><LogoMark size={16} /> Made in the U.S.A. · Est. 2026</span>
          </div>
          <h1 className="hero-title"><span className="navy">The</span> <span className="burg">Forgotten</span><span className="red">.</span></h1>
          <div className="hero-grid">
            <p className="hero-statement">
              Honoring the veterans our communities overlook, and telling the stories of people too often reduced to{" "}
              <em>statistics.</em>
            </p>
            <div>
              <p className="hero-lead">
                Teenagers across the country listen to, document, and share the lives of veterans experiencing
                homelessness, isolated seniors, and others who go unseen.
              </p>
              <div className="hero-actions">
                <Link href="/stories" className="btn btn-primary arrow">Enter the archive</Link>
                <Link href="/share" className="btn btn-dark">Share a story</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <span key={k}>{[...MARQUEE, ...MARQUEE].map((w, i) => <span key={i}>{w}<i>★</i></span>)}</span>
          ))}
        </div>
      </div>

      {/* ---------- Manifesto ---------- */}
      <section className="manifesto">
        <div className="star-field" aria-hidden />
        <div className="wrap" style={{ position: "relative" }}>
          <p className="section-label">The problem</p>
          <p className="big">
            Veterans who served are sleeping on the streets. Seniors are growing isolated and unseen. Their lives get
            flattened into <s>numbers</s>. We&rsquo;re bringing back the <em>names.</em>
          </p>
          {featured.length > 0 && (
            <div className="names">
              {featured.map((s) => (
                <Link key={s.id} href={`/stories/${s.slug}`}>{s.subject_display_name}.</Link>
              ))}
              <Link href="/share" style={{ color: "#7d7a73" }}>Who&rsquo;s next?</Link>
            </div>
          )}
          <p className="sub">
            The Forgotten trains teenagers to listen, document, and share these personal stories, so readers see the
            person, not the statistic, and are moved to help.
          </p>
        </div>
      </section>

      {/* ---------- Featured stories ---------- */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="section-label">From the archive</p>
              <h2>Stories worth preserving</h2>
            </div>
            <Link href="/stories" className="btn btn-outline btn-small arrow">All stories</Link>
          </div>

          {lead ? (
            <>
              <Link href={`/stories/${lead.slug}`} className="feature-lead">
                <Cover story={lead} big tone="burgundy" />
                <div>
                  <div className="tags">
                    <span className="tag tag-red">Featured</span>
                    <span className="tag">{subjectLabel(lead)}</span>
                    <span className="tag">{fileNo(lead)}</span>
                  </div>
                  <h3>{lead.title}</h3>
                  <p>{lead.summary}</p>
                  <div className="mono muted">{lead.subject_display_name} · {placeLabel(lead)} · by {lead.contributor_credit}</div>
                </div>
              </Link>
              {rest.length > 0 && (
                <div className="grid-stories">{rest.slice(0, 3).map((s, i) => <StoryCard key={s.id} story={s} tone={(["navy", "red", "burgundy"] as const)[i % 3]} />)}</div>
              )}
            </>
          ) : (
            <div className="empty">The first stories are being gathered now. <Link href="/share">Be one of the first to contribute.</Link></div>
          )}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="navy-band">
        <div className="wrap">
          <p className="section-label">How it works</p>
          <h2 style={{ marginBottom: 36 }}>Three phases, one archive</h2>
          <div className="phases">
            <div className="phase">
              <div className="num">01</div>
              <div><span className="kicker">Build it</span><h3>The Story Database</h3></div>
              <p>A digital archive of personal stories collected by teens across the U.S. and beyond, through written narratives, interviews, and photography, organized by theme, region, and issue.</p>
            </div>
            <div className="phase">
              <div className="num">02</div>
              <div><span className="kicker">Share it</span><h3>Digital Advocacy</h3></div>
              <p>Selected stories are shared here and on social media to shift perceptions and spark empathy, with resources and links to nonprofits so readers can help.</p>
            </div>
            <div className="phase">
              <div className="num">03</div>
              <div><span className="kicker">Give back</span><h3>The Coffee Table Book</h3></div>
              <p>The strongest stories become a curated book of narratives and photography that celebrates identity, service, and humanity. All proceeds go to established nonprofits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Already in motion ---------- */}
      <section>
        <div className="wrap">
          <p className="section-label">Already in motion</p>
          <div className="motion-grid">
            <div className="motion-cell burg" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24 }}>
              <p className="lead-q">Founded by a high school sophomore who has already turned concern into action.</p>
              <Link href="/about" className="mono" style={{ color: "var(--red)" }}>Read the origin story →</Link>
            </div>
            <div className="motion-cell">
              <div className="stat-num">50</div>
              <div className="stat-label">care packages led and distributed to people experiencing homelessness</div>
            </div>
            <div className="motion-cell">
              <div className="stat-num">01</div>
              <div className="stat-label">school-wide presentation raising awareness of the issue</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Principles ---------- */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="section-label">How we do it</p>
          <ul className="principles">
            <li><span className="p-num">§ 01</span><strong>Dignity first</strong><span className="d">We highlight identity, service, and proud moments, not just hardship.</span></li>
            <li><span className="p-num">§ 02</span><strong>Consent always</strong><span className="d">Every story is shared with written permission and can be withdrawn.</span></li>
            <li><span className="p-num">§ 03</span><strong>Safe by design</strong><span className="d">Interviews happen in public or supervised settings, ideally through partner organizations.</span></li>
            <li><span className="p-num">§ 04</span><strong>Youth-powered</strong><span className="d">Teens from diverse communities document the stories closest to them.</span></li>
          </ul>
        </div>
      </section>

      {/* ---------- Vision + flag ---------- */}
      <section style={{ paddingTop: 40 }}>
        <div className="wrap flag-section">
          <figure className="flag-figure">
            <Flag />
            <figcaption><span>Fig. 01: 13 stripes · 50 stars</span><span>For those who served</span></figcaption>
          </figure>
          <div>
            <p className="section-label">Our vision</p>
            <blockquote>
              A lasting archive of human experience, showing that <strong>every person has a story worth preserving</strong>,
              every community deserves to be seen, and <em>every story has the potential to inspire change.</em>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="cta">
        <div className="cta-stars" aria-hidden>★</div>
        <div className="wrap" style={{ position: "relative" }}>
          <p className="display">Know a story<br />that deserves<br />to be told?</p>
          <p>
            Teens anywhere can become contributors. We&rsquo;ll show you how to interview safely and respectfully, get
            consent, and write a story that honors the person behind it.
          </p>
          <div className="hero-actions">
            <Link href="/get-involved" className="btn btn-dark arrow">Become a contributor</Link>
            <Link href="/get-involved#resources" className="btn btn-ghost">Ways to help</Link>
          </div>
        </div>
      </section>
    </>
  );
}
