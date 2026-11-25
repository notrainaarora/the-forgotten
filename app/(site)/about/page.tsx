import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <p className="eyebrow">About the project</p>
          <h1>See the person, not the statistic</h1>
          <p>The Forgotten is a youth-led initiative that trains teenagers to listen to, document, and share the stories of people their communities overlook.</p>
        </div>
      </div>
      <section>
        <div className="narrow prose">
          <h2>Why this exists</h2>
          <p>
            Veterans who served this country are sleeping on the streets. Seniors are growing isolated and unseen.
            When their lives show up in the news, it&rsquo;s usually as a number. We think the fastest way to change how
            people respond to an issue is to help them meet one person inside it.
          </p>

          <h2>How it works</h2>
          <ol>
            <li><strong>Teens connect</strong> with a veteran, senior, or someone else overlooked in their own community, ideally through a shelter, senior center, VA program, or other partner organization.</li>
            <li><strong>They get written consent</strong>, then listen and document the person&rsquo;s story through writing, interviews, and photography.</li>
            <li><strong>Every submission is reviewed</strong> before it&rsquo;s published, for accuracy, dignity, and safety.</li>
            <li><strong>Stories go into the archive</strong>, organized by theme, region, and issue, and the strongest are shared on social media.</li>
            <li><strong>The best become a book.</strong> A curated coffee table book of narratives and photography, with all proceeds going to established nonprofits.</li>
          </ol>

          <h2>Our principles</h2>
          <ul className="principles" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 20 }}>
            <li><span className="p-num">§ 01</span><strong>Dignity first</strong><span className="d">We highlight identity, service, and proud moments, not just hardship.</span></li>
            <li><span className="p-num">§ 02</span><strong>Consent always</strong><span className="d">Every story is shared with written permission, and anyone can ask to have it changed or removed. <Link href="/withdraw">Here&rsquo;s how.</Link></span></li>
            <li style={{ paddingLeft: 0, borderLeft: 0 }}><span className="p-num">§ 03</span><strong>Safe by design</strong><span className="d">Interviews happen in public or supervised settings, ideally through partner organizations. We never publish exact locations.</span></li>
            <li><span className="p-num">§ 04</span><strong>Youth-powered</strong><span className="d">Teens from diverse communities document the stories closest to them.</span></li>
          </ul>

          <h2>Who&rsquo;s behind it</h2>
          <p>
            The Forgotten was founded by {SITE.founder}, a high school sophomore who had already led a drive that
            assembled and distributed 50 care packages to people experiencing homelessness, and gave a school-wide
            presentation to raise awareness of the issue.
          </p>
          <p>
            Want to partner with us, bring The Forgotten to your school, or connect us with an organization?{" "}
            <a href={`mailto:${SITE.contactEmail}`}>Email {SITE.contactEmail}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
