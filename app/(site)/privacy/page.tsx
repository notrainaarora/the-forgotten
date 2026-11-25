import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <>
      <div className="page-head"><div className="wrap"><h1>Privacy</h1><p>What we collect, why, and who can see it.</p></div></div>
      <section>
        <div className="narrow prose">
          <h2>Contributors</h2>
          <p>
            When you submit a story or sign up, we collect your name, email, school (optional), age group, and, if you&rsquo;re
            under 18, a parent or guardian&rsquo;s name and email. We use these only to review your submission, contact you
            about it, and credit you. Publicly, you&rsquo;re credited only by the credit line you choose (for example, &ldquo;Maya R.&rdquo;).
            We never show your email or your guardian&rsquo;s information. Contributors must be 13 or older.
          </p>
          <h2>People whose stories we share</h2>
          <p>
            We publish a story only with the person&rsquo;s signed consent, using the name they agreed to, and photos only if
            they agreed to photos. We show a general area (city or state), never an exact location. Signed consent forms are
            stored privately and can be viewed only by our review team.
          </p>
          <h2>Changing or removing a story</h2>
          <p>
            The person in a story, their family, or the contributor can ask us to change or remove it at any time using the{" "}
            <Link href="/withdraw">withdrawal form</Link>. We take withdrawn stories off the site promptly.
          </p>
          <h2>Who can see private information</h2>
          <p>
            Only signed-in members of our review team. Information is stored with our database provider (Supabase) and we
            don&rsquo;t sell or share it.
          </p>
          <h2>Questions</h2>
          <p>Email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.</p>
        </div>
      </section>
    </>
  );
}
