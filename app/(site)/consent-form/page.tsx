import type { Metadata } from "next";
import PrintButton from "./PrintButton";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Story consent form" };

const Line = ({ label, wide }: { label: string; wide?: boolean }) => (
  <div style={{ flex: wide ? 2 : 1, minWidth: 180 }}>
    <div style={{ borderBottom: "1px solid #333", height: 34 }} />
    <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{label}</div>
  </div>
);
const Box = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: 10, margin: "8px 0" }}>
    <span style={{ width: 16, height: 16, border: "1.5px solid #333", flex: "none", marginTop: 4 }} />
    <span>{children}</span>
  </div>
);

export default function ConsentForm() {
  return (
    <section>
      <div className="narrow">
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          <p className="muted" style={{ margin: 0 }}>Print one copy per person. Upload a photo or scan of the signed form when you submit the story.</p>
          <PrintButton />
        </div>

        <div className="form-card print-sheet" style={{ fontSize: 15, lineHeight: 1.55 }}>
          <div style={{ borderBottom: "4px solid #6e1f2b", paddingBottom: 10, marginBottom: 16 }}>
            <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: "0.02em" }}>THE FORGOTTEN</div>
            <div style={{ fontWeight: 700 }}>Story Sharing Consent Form</div>
          </div>

          <p>
            <strong>The Forgotten</strong> is a youth-led project that shares the stories of veterans, seniors, and others
            whose lives are often overlooked. A student contributor would like to interview you and share your story on our
            website ({SITE.url.replace(/^https?:\/\//, "")}), on social media, and possibly in a printed book. All proceeds from the
            book go to established nonprofits. Taking part is voluntary and unpaid.
          </p>

          <p style={{ fontWeight: 700, margin: "16px 0 4px" }}>Please check each item you agree to:</p>
          <Box>I agree to be interviewed and for my story to be written and published on The Forgotten&rsquo;s website.</Box>
          <Box>I agree that my story may be shared on The Forgotten&rsquo;s social media.</Box>
          <Box>You may use my real first name. (If unchecked, a different name will be used.) Name to use: ____________________</Box>
          <Box>You may take and publish photographs of me.</Box>
          <Box>My story (and photos, if checked above) may be included in The Forgotten&rsquo;s printed book.</Box>

          <p style={{ fontWeight: 700, margin: "16px 0 4px" }}>I understand that:</p>
          <ul style={{ marginTop: 4 }}>
            <li>I can skip any question and stop the interview at any time.</li>
            <li>My full name, address, and exact location will not be published.</li>
            <li>The story may be edited for length and clarity, but not to change its meaning.</li>
            <li>
              I can ask for my story to be changed or removed from the website at any time by visiting{" "}
              {SITE.url.replace(/^https?:\/\//, "")}/withdraw or emailing {SITE.contactEmail}. (Copies of a book that has
              already been printed cannot be recalled.)
            </li>
          </ul>

          <p style={{ fontWeight: 700, margin: "20px 0 4px" }}>Person sharing their story</p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Line label="Signature" wide /><Line label="Printed name" /><Line label="Date" />
          </div>
          <p style={{ fontSize: 13, color: "#555" }}>If the person has a legal guardian or representative who signs on their behalf:</p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Line label="Guardian / representative signature" wide /><Line label="Printed name & relationship" /><Line label="Date" />
          </div>

          <p style={{ fontWeight: 700, margin: "20px 0 4px" }}>Student contributor</p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Line label="Signature" wide /><Line label="Printed name" /><Line label="Date" />
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Line label="Contributor's parent/guardian signature (if under 18)" wide /><Line label="Printed name" /><Line label="Date" />
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Line label="Partner organization (if any)" wide /><Line label="Staff witness name" />
          </div>

          <p style={{ fontSize: 12, color: "#666", marginTop: 22 }}>
            Questions? Contact {SITE.founder}, {SITE.contactEmail}. Thank you for trusting us with your story.
          </p>
        </div>
      </div>
    </section>
  );
}
