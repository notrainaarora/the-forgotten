import type { Metadata } from "next";
import Link from "next/link";
import ShareForm from "./ShareForm";
import { getThemes } from "@/lib/data";

export const metadata: Metadata = { title: "Share a story" };

export default async function SharePage() {
  const themes = await getThemes();
  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <p className="eyebrow">Contribute</p>
          <h1>Share a story</h1>
          <p>Submit a story you&rsquo;ve documented. Every submission is reviewed before it&rsquo;s published.</p>
        </div>
      </div>
      <section>
        <div className="narrow">
          <div className="notice notice-warn" style={{ marginBottom: 24 }}>
            <strong>Before you start:</strong> you&rsquo;ll need the person&rsquo;s{" "}
            <Link href="/consent-form">signed consent form</Link> (a photo of it is fine). First time? Read the{" "}
            <Link href="/get-involved#guide">interview guide</Link>.
          </div>
          <ShareForm themes={themes} />
        </div>
      </section>
    </>
  );
}
