import type { Metadata } from "next";
import Link from "next/link";
import SignupForm from "./SignupForm";
import { RESOURCES, SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Get involved" };

export default function GetInvolved() {
  const groups = [...new Set(RESOURCES.map((r) => r.group))];
  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <p className="eyebrow">{SITE.motto}</p>
          <h1>Get involved</h1>
          <p>Become a contributor, learn how to interview with care, or find organizations doing the work every day.</p>
        </div>
      </div>

      <section>
        <div className="wrap split">
          <div className="prose">
            <p className="section-label">Become a contributor</p>
            <h2>Teens anywhere can join</h2>
            <p>
              Contributors find someone in their own community whose story deserves to be told, interview them safely
              and respectfully, and submit the story for review. You don&rsquo;t need experience, just curiosity and care.
            </p>
            <ol>
              <li>Sign up here so we can welcome you and answer questions.</li>
              <li>Read the interview guide below.</li>
              <li>Connect with someone, ideally through a shelter, senior center, VA program, or your own family.</li>
              <li>Get their signed <Link href="/consent-form">consent form</Link>.</li>
              <li>Write it up and <Link href="/share">submit it</Link>.</li>
            </ol>
          </div>
          <div className="form-card"><SignupForm /></div>
        </div>
      </section>

      <section id="guide" style={{ paddingTop: 0 }}>
        <div className="narrow prose">
          <p className="section-label">Interview guide</p>
          <h2>How to listen well, and stay safe</h2>

          <h3>Safety first</h3>
          <ul>
            <li><strong>Go through a partner when you can.</strong> Shelters, senior centers, VA programs, libraries, and places of worship can introduce you and give you a supervised space.</li>
            <li><strong>Never meet alone in a private place.</strong> Interview in public or with a parent, teacher, or staff member nearby. If you&rsquo;re under 18, a parent or guardian should always know where you are and who you&rsquo;re meeting.</li>
            <li><strong>Don&rsquo;t share personal contact info</strong> (yours or theirs) beyond what&rsquo;s needed. Coordinate through the partner organization.</li>
            <li><strong>If someone is in crisis,</strong> pause the interview and tell a trusted adult or staff member. Veterans can dial 988 then press 1 for the Veterans Crisis Line. In an emergency, call 911.</li>
          </ul>

          <h3>Consent, every time</h3>
          <ul>
            <li>Explain what The Forgotten is and where the story will appear before you begin.</li>
            <li>Have them read and sign the <Link href="/consent-form">consent form</Link>. They choose whether to use their real first name, whether photos are okay, and whether the story can appear in the book.</li>
            <li>Ask before you record or take any photo. Let them skip any question.</li>
            <li>Tell them they can change their mind later, and how: the <Link href="/withdraw">withdrawal form</Link> or by email.</li>
          </ul>

          <h3>Dignity first</h3>
          <ul>
            <li>Start with who they are, not what happened to them. Ask about work, family, service, skills, places, and proud moments.</li>
            <li>Let them lead on hard topics. You don&rsquo;t need every detail of a difficult time to tell a true story.</li>
            <li>Use their words. A great quote does more than a paragraph of description.</li>
            <li>Avoid labels like &ldquo;a homeless man.&rdquo; Try &ldquo;Walter, a Navy veteran who is experiencing homelessness.&rdquo;</li>
          </ul>

          <h3>Questions to get started</h3>
          <ul>
            <li>Where did you grow up? What was it like?</li>
            <li>What&rsquo;s a job or role you&rsquo;ve had that you&rsquo;re proud of?</li>
            <li>(Veterans) What do you remember most about your service? Who did you serve with?</li>
            <li>Who are the people who matter most to you?</li>
            <li>What&rsquo;s something people would be surprised to learn about you?</li>
            <li>What do you wish people understood about your life right now?</li>
            <li>What would you want a teenager reading this to take away?</li>
          </ul>

          <h3>Writing it up</h3>
          <ul>
            <li>Open with a specific moment or detail, not a statistic.</li>
            <li>Keep exact locations out. A city or state is enough.</li>
            <li>Read it back to them, or to the partner organization, if you can.</li>
          </ul>
        </div>
      </section>

      <section id="resources" className="band">
        <div className="wrap">
          <p className="section-label" style={{ color: "#d7aab1" }}>Ways to help</p>
          <h2>Organizations doing the work</h2>
          <p style={{ maxWidth: 680 }}>If a story moved you, these are good places to start. If you or someone you know needs help now, the first three are free and confidential.</p>
          {groups.map((g) => (
            <div key={g} style={{ marginTop: 28 }}>
              <h3 style={{ color: "#fff" }}>{g}</h3>
              <div className="resource-grid">
                {RESOURCES.filter((r) => r.group === g).map((r) => (
                  <a key={r.name} href={r.href} target="_blank" rel="noopener noreferrer" className="resource" style={{ textDecoration: "none", color: "inherit" }}>
                    <h3>{r.name} ↗</h3>
                    <p>{r.detail}</p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
