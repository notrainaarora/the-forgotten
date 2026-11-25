import Link from "next/link";
import { SITE } from "@/lib/constants";
import { LogoMark } from "@/components/Logo";

export default function SiteFooter() {
  return (
    <>
    <div className="stripes" aria-hidden />
    <footer className="site-footer">
      <div className="wrap">
        <p className="footer-mega" aria-label={SITE.motto}>Listen<span>.</span> Document<span>.</span> Share<span>.</span></p>
        <div className="footer-cols">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <LogoMark size={32} />
              <span style={{ fontFamily: "var(--display)", fontSize: 26, color: "var(--bone)", textTransform: "uppercase", letterSpacing: "0.02em" }}>The Forgotten</span>
            </div>
            <p style={{ margin: "0 0 10px", maxWidth: 440 }}>
              A youth-led storytelling, advocacy &amp; philanthropic initiative telling the stories of veterans experiencing
              homelessness, seniors, and others too often reduced to statistics.
            </p>
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
          </div>
          <div>
            <h4>Explore</h4>
            <Link href="/stories">The archive</Link>
            <Link href="/about">About the project</Link>
            <Link href="/get-involved#resources">Ways to help</Link>
          </div>
          <div>
            <h4>Contribute</h4>
            <Link href="/share">Share a story</Link>
            <Link href="/get-involved">Become a contributor</Link>
            <Link href="/consent-form">Consent form</Link>
            <Link href="/withdraw">Change or remove a story</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} The Forgotten · Every story shared with written permission</span>
          <span><Link href="/privacy">Privacy</Link> · theforgotten.site</span>
        </div>
      </div>
    </footer>
    </>
  );
}
