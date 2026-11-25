"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Turnstile from "@/components/Turnstile";
import { BRANCHES, ERAS, FORMATS, INTERVIEW_SETTINGS, SUBJECT_TYPES, US_STATES } from "@/lib/constants";

type Theme = { slug: string; label: string };
type PhotoItem = { file: File; preview: string; caption: string; alt_text: string };
type Errors = Record<string, string>;

const OUTSIDE_US = "__outside__";

export default function ShareForm({ themes }: { themes: Theme[] }) {
  const [f, setF] = useState({
    website: "",
    contributor_name: "", contributor_credit: "", contributor_email: "", contributor_school: "",
    contributor_age_group: "" as "" | "13-17" | "18+", age_13_plus: false,
    guardian_name: "", guardian_email: "", guardian_approved: false,
    subject_display_name: "", subject_type: "" as string, subject_type_other: "", service_branch: "", service_era: "",
    city: "", regionSelect: "", region: "", country: "United States",
    interview_setting: "", partner_org: "",
    consent_signed_by: "", consent_signed_on: "", consent_real_name: false, consent_photos: false, consent_book: false,
    title: "", format: "written", summary: "", body: "", pull_quote: "",
    attest_truthful: false, attest_guidelines: false,
  });
  const [themesSel, setThemesSel] = useState<string[]>([]);
  const [consentFile, setConsentFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "done">("idle");
  const [demo, setDemo] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const [humanToken, setHumanToken] = useState("");

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const minor = f.contributor_age_group === "13-17";
  const outside = f.regionSelect === OUTSIDE_US;

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createClient(url, key) : null;
  }, []);

  function toggleTheme(slug: string) {
    setThemesSel((cur) => (cur.includes(slug) ? cur.filter((t) => t !== slug) : cur.length >= 5 ? cur : [...cur, slug]));
  }

  function addPhotos(list: FileList | null) {
    if (!list) return;
    const next = [...photos];
    for (const file of Array.from(list)) {
      if (next.length >= 8) break;
      next.push({ file, preview: URL.createObjectURL(file), caption: "", alt_text: "" });
    }
    setPhotos(next);
  }

  function clientCheck(): Errors {
    const e: Errors = {};
    if (!consentFile) e.consent_file_path = "Attach a photo or scan of the signed consent form";
    if (consentFile && consentFile.size > 10 * 1024 * 1024) e.consent_file_path = "The file must be 10 MB or smaller";
    if (photos.some((p) => p.file.size > 10 * 1024 * 1024)) e.photos = "Each photo must be 10 MB or smaller";
    if (photos.length && !f.consent_photos) e.consent_photos = "Photos can only be included if the person agreed to them";
    if (f.body.trim().length < 200) e.body = "The story should be at least 200 characters";
    return e;
  }

  function showErrors(e: Errors, message: string) {
    setErrors(e);
    setFormError(message);
    setStatus("idle");
    requestAnimationFrame(() => {
      const first = Object.keys(e)[0];
      const el = first && document.querySelector(`[data-field="${first}"]`);
      (el || topRef.current)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setFormError("");
    const pre = clientCheck();
    if (Object.keys(pre).length) return showErrors(pre, "Please fix the highlighted fields.");

    try {
      setStatus("uploading");
      const files = [
        { kind: "consent" as const, type: consentFile!.type, size: consentFile!.size },
        ...photos.map((p) => ({ kind: "photo" as const, type: p.file.type, size: p.file.size })),
      ];
      const prep = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      }).then((r) => r.json());
      if (prep.error) return showErrors({}, prep.error);

      const uploads: { kind: string; bucket: string; path: string; token: string }[] = prep.uploads;
      if (!prep.demo) {
        if (!supabase) return showErrors({}, "Uploads aren't configured yet.");
        const blobs = [consentFile!, ...photos.map((p) => p.file)];
        for (const [i, u] of uploads.entries()) {
          const { error } = await supabase.storage.from(u.bucket).uploadToSignedUrl(u.path, u.token, blobs[i], {
            contentType: blobs[i].type,
          });
          if (error) return showErrors({}, `Upload failed for ${blobs[i].name}. Please try again.`);
        }
      }

      setStatus("saving");
      const region = outside ? f.region : f.regionSelect;
      const payload = {
        ...f,
        region,
        country: outside ? f.country : "United States",
        submission_id: prep.submission_id,
        turnstile_token: humanToken,
        themes: themesSel,
        consent_file_path: uploads[0].path,
        photos: photos.map((p, i) => ({ path: uploads[i + 1].path, caption: p.caption, alt_text: p.alt_text })),
      };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json());
      if (!res.ok) return showErrors(res.fields ?? {}, res.error ?? "Something went wrong.");

      setDemo(Boolean(res.demo));
      setStatus("done");
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {
      showErrors({}, "Network problem. Check your connection and try again.");
    }
  }

  if (status === "done") {
    return (
      <div ref={topRef} className="form-card" style={{ textAlign: "center", padding: "48px 30px" }}>
        <h2 style={{ justifyContent: "center" }}>Thank you, {f.contributor_name.split(" ")[0]}.</h2>
        <p className="big-text" style={{ margin: "0 auto 18px", fontSize: 18 }}>
          {f.subject_display_name}&rsquo;s story is in. Our team reviews every submission for accuracy, dignity, and
          safety before it&rsquo;s published, and we&rsquo;ll email you at {f.contributor_email} if we have questions.
        </p>
        {demo && <div className="notice notice-warn">Preview mode: nothing was actually saved.</div>}
        <Link href="/stories" className="btn btn-primary">Read other stories</Link>
      </div>
    );
  }

  const busy = status !== "idle";
  const err = (k: string) => errors[k] && <div className="error" role="alert">{errors[k]}</div>;

  return (
    <form onSubmit={onSubmit} noValidate>
      <div ref={topRef} />
      {formError && <div className="notice notice-err" role="alert">{formError}</div>}

      <div className="honeypot" aria-hidden>
        <label>Leave this empty <input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} /></label>
      </div>

      {/* 1. About you */}
      <div className="form-card">
        <h2><span className="num">1</span> About you</h2>
        <p className="muted">Private. We only show the credit line you choose below.</p>
        <div className="row">
          <div className="field" data-field="contributor_name">
            <label htmlFor="cn">Your full name</label>
            <input id="cn" type="text" required value={f.contributor_name} onChange={(e) => set("contributor_name", e.target.value)} />
            {err("contributor_name")}
          </div>
          <div className="field" data-field="contributor_credit">
            <label htmlFor="cc">Credit me as</label>
            <input id="cc" type="text" required placeholder="e.g. Maya R." value={f.contributor_credit} onChange={(e) => set("contributor_credit", e.target.value)} />
            {err("contributor_credit")}
          </div>
        </div>
        <div className="row">
          <div className="field" data-field="contributor_email">
            <label htmlFor="ce">Email</label>
            <input id="ce" type="email" required value={f.contributor_email} onChange={(e) => set("contributor_email", e.target.value)} />
            {err("contributor_email")}
          </div>
          <div className="field">
            <label htmlFor="cs">School <span className="muted">(optional)</span></label>
            <input id="cs" type="text" value={f.contributor_school} onChange={(e) => set("contributor_school", e.target.value)} />
          </div>
        </div>
        <div className="field" data-field="contributor_age_group">
          <span className="label">Your age</span>
          <div className="chips" role="radiogroup">
            {(["13-17", "18+"] as const).map((a) => (
              <label key={a} className={`chip ${f.contributor_age_group === a ? "on" : ""}`}>
                <input type="radio" name="age" checked={f.contributor_age_group === a} onChange={() => set("contributor_age_group", a)} />
                {a === "13-17" ? "13 to 17" : "18 or older"}
              </label>
            ))}
          </div>
          {err("contributor_age_group")}
        </div>
        <label className="check" data-field="age_13_plus">
          <input type="checkbox" checked={f.age_13_plus} onChange={(e) => set("age_13_plus", e.target.checked)} />
          <span>I am 13 or older.</span>
        </label>
        {err("age_13_plus")}

        {minor && (
          <div className="notice notice-info" style={{ marginTop: 12 }}>
            <strong>Under 18?</strong> A parent or guardian needs to know about and approve your submission.
            <div className="row" style={{ marginTop: 12 }}>
              <div className="field" data-field="guardian_name">
                <label htmlFor="gn">Parent/guardian name</label>
                <input id="gn" type="text" value={f.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} />
                {err("guardian_name")}
              </div>
              <div className="field" data-field="guardian_email">
                <label htmlFor="ge">Parent/guardian email</label>
                <input id="ge" type="email" value={f.guardian_email} onChange={(e) => set("guardian_email", e.target.value)} />
                {err("guardian_email")}
              </div>
            </div>
            <label className="check" data-field="guardian_approved">
              <input type="checkbox" checked={f.guardian_approved} onChange={(e) => set("guardian_approved", e.target.checked)} />
              <span>My parent or guardian has read this submission and approves it.</span>
            </label>
            {err("guardian_approved")}
          </div>
        )}
      </div>

      {/* 2. About the person */}
      <div className="form-card">
        <h2><span className="num">2</span> The person you interviewed</h2>
        <div className="row">
          <div className="field" data-field="subject_display_name">
            <label htmlFor="sn">Name to use in the story</label>
            <p className="hint">Their first name, or a pseudonym if they prefer. Never a full name or address.</p>
            <input id="sn" type="text" value={f.subject_display_name} onChange={(e) => set("subject_display_name", e.target.value)} />
            {err("subject_display_name")}
          </div>
          <div className="field" data-field="subject_type">
            <label htmlFor="st">They are a&hellip;</label>
            <p className="hint">&nbsp;</p>
            <select id="st" value={f.subject_type} onChange={(e) => set("subject_type", e.target.value)}>
              <option value="">Choose one</option>
              {SUBJECT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {err("subject_type")}
          </div>
        </div>
        {f.subject_type === "other" && (
          <div className="field" data-field="subject_type_other">
            <label htmlFor="sto">Who are they, in a few words?</label>
            <input id="sto" type="text" placeholder="e.g. Former farmworker, refugee, caregiver" value={f.subject_type_other} onChange={(e) => set("subject_type_other", e.target.value)} />
            {err("subject_type_other")}
          </div>
        )}
        {f.subject_type === "veteran" && (
          <div className="row">
            <div className="field">
              <label htmlFor="sb">Branch <span className="muted">(optional)</span></label>
              <select id="sb" value={f.service_branch} onChange={(e) => set("service_branch", e.target.value)}>
                <option value="">—</option>
                {BRANCHES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="se">Era <span className="muted">(optional)</span></label>
              <select id="se" value={f.service_era} onChange={(e) => set("service_era", e.target.value)}>
                <option value="">—</option>
                {ERAS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
        )}
        <div className="row">
          <div className="field">
            <label htmlFor="city">City or area <span className="muted">(optional)</span></label>
            <p className="hint">General area only.</p>
            <input id="city" type="text" value={f.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div className="field" data-field="region">
            <label htmlFor="rs">State</label>
            <p className="hint">&nbsp;</p>
            <select id="rs" value={f.regionSelect} onChange={(e) => set("regionSelect", e.target.value)}>
              <option value="">Choose</option>
              {US_STATES.map((s) => <option key={s}>{s}</option>)}
              <option value={OUTSIDE_US}>Outside the U.S.</option>
            </select>
            {!outside && err("region")}
          </div>
        </div>
        {outside && (
          <div className="row">
            <div className="field" data-field="country">
              <label htmlFor="co">Country</label>
              <input id="co" type="text" value={f.country === "United States" ? "" : f.country} onChange={(e) => set("country", e.target.value)} />
              {err("country")}
            </div>
            <div className="field">
              <label htmlFor="rg">Region / province</label>
              <input id="rg" type="text" value={f.region} onChange={(e) => set("region", e.target.value)} />
              {err("region")}
            </div>
          </div>
        )}
        <div className="field" data-field="interview_setting">
          <label htmlFor="is">Where did the interview happen?</label>
          <p className="hint">For everyone&rsquo;s safety, interviews should be in public or supervised settings.</p>
          <select id="is" value={f.interview_setting} onChange={(e) => set("interview_setting", e.target.value)}>
            <option value="">Choose one</option>
            {INTERVIEW_SETTINGS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {err("interview_setting")}
        </div>
        {f.interview_setting === "partner_org" && (
          <div className="field">
            <label htmlFor="po">Organization name</label>
            <input id="po" type="text" value={f.partner_org} onChange={(e) => set("partner_org", e.target.value)} />
          </div>
        )}
      </div>

      {/* 3. Consent */}
      <div className="form-card">
        <h2><span className="num">3</span> Their written consent</h2>
        <p className="muted">
          Every story needs a signed consent form. <Link href="/consent-form" target="_blank">Print the form here</Link>,
          have them sign it, then upload a photo or scan.
        </p>
        <div className="row">
          <div className="field" data-field="consent_signed_by">
            <label htmlFor="csb">Signed by</label>
            <input id="csb" type="text" value={f.consent_signed_by} onChange={(e) => set("consent_signed_by", e.target.value)} />
            {err("consent_signed_by")}
          </div>
          <div className="field" data-field="consent_signed_on">
            <label htmlFor="cso">Date signed</label>
            <input id="cso" type="date" value={f.consent_signed_on} onChange={(e) => set("consent_signed_on", e.target.value)} />
            {err("consent_signed_on")}
          </div>
        </div>
        <div className="field" data-field="consent_file_path">
          <label htmlFor="cf">Signed consent form</label>
          <p className="hint">PDF or photo, up to 10 MB. Kept private; only our review team can see it.</p>
          <input id="cf" type="file" accept="application/pdf,image/jpeg,image/png,image/heic" onChange={(e) => setConsentFile(e.target.files?.[0] ?? null)} />
          {err("consent_file_path")}
        </div>
        <span className="label" style={{ fontWeight: 700, display: "block", marginBottom: 8 }}>On the form, they agreed that we may&hellip;</span>
        <label className="check">
          <input type="checkbox" checked={f.consent_real_name} onChange={(e) => set("consent_real_name", e.target.checked)} />
          <span>use their real first name (otherwise we&rsquo;ll treat the name above as a pseudonym)</span>
        </label>
        <label className="check" data-field="consent_photos">
          <input type="checkbox" checked={f.consent_photos} onChange={(e) => set("consent_photos", e.target.checked)} />
          <span>publish photos of them</span>
        </label>
        {err("consent_photos")}
        <label className="check">
          <input type="checkbox" checked={f.consent_book} onChange={(e) => set("consent_book", e.target.checked)} />
          <span>include their story in The Forgotten&rsquo;s book (all proceeds go to nonprofits)</span>
        </label>
      </div>

      {/* 4. The story */}
      <div className="form-card">
        <h2><span className="num">4</span> The story</h2>
        <div className="notice notice-info">
          <strong>Dignity first.</strong> Tell us who they are: what they did, what they love, what they&rsquo;re proud of.
          Hardship can be part of the story, but it shouldn&rsquo;t be the whole story.
        </div>
        <div className="row">
          <div className="field" data-field="title">
            <label htmlFor="ti">Title</label>
            <input id="ti" type="text" maxLength={140} value={f.title} onChange={(e) => set("title", e.target.value)} />
            {err("title")}
          </div>
          <div className="field">
            <label htmlFor="fo">Format</label>
            <select id="fo" value={f.format} onChange={(e) => set("format", e.target.value)}>
              {FORMATS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
          </div>
        </div>
        <div className="field" data-field="summary">
          <label htmlFor="su">One- or two-sentence summary</label>
          <textarea id="su" style={{ minHeight: 80 }} maxLength={400} value={f.summary} onChange={(e) => set("summary", e.target.value)} />
          <div className="counter">{f.summary.length}/400</div>
          {err("summary")}
        </div>
        <div className="field" data-field="body">
          <label htmlFor="bo">Their story</label>
          <p className="hint">
            Leave a blank line between paragraphs. For interviews, put each question in **double asterisks**.
          </p>
          <textarea id="bo" className="tall" maxLength={20000} value={f.body} onChange={(e) => set("body", e.target.value)} />
          <div className="counter">{f.body.length.toLocaleString()}/20,000</div>
          {err("body")}
        </div>
        <div className="field">
          <label htmlFor="pq">A line from them that stays with you <span className="muted">(optional)</span></label>
          <input id="pq" type="text" maxLength={280} value={f.pull_quote} onChange={(e) => set("pull_quote", e.target.value)} />
        </div>
        <div className="field">
          <span className="label">Themes <span className="muted">(up to 5)</span></span>
          <div className="chips">
            {themes.map((t) => (
              <label key={t.slug} className={`chip ${themesSel.includes(t.slug) ? "on" : ""}`}>
                <input type="checkbox" checked={themesSel.includes(t.slug)} onChange={() => toggleTheme(t.slug)} />
                {t.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Photos */}
      <div className="form-card" data-field="photos">
        <h2><span className="num">5</span> Photos <span className="muted" style={{ fontSize: 16, fontWeight: 400 }}>(optional)</span></h2>
        {!f.consent_photos ? (
          <p className="muted">Photos can be added once you&rsquo;ve confirmed above that they agreed to photos.</p>
        ) : (
          <>
            <p className="muted">Up to 8 photos, 10 MB each. Portraits, hands at work, objects that matter to them.</p>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} disabled={photos.length >= 8} />
            {err("photos")}
            <ul className="upload-list">
              {photos.map((p, i) => (
                <li key={p.preview} className="upload-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview} alt="" />
                  <div>
                    <input type="text" placeholder="Caption (shown under the photo)" value={p.caption} style={{ marginBottom: 8 }}
                      onChange={(e) => setPhotos((ps) => ps.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} />
                    <input type="text" placeholder="Describe the photo for people using screen readers" value={p.alt_text}
                      onChange={(e) => setPhotos((ps) => ps.map((x, j) => (j === i ? { ...x, alt_text: e.target.value } : x)))} />
                  </div>
                  <button type="button" className="btn btn-outline btn-small" onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))}>Remove</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* 6. Confirm */}
      <div className="form-card">
        <h2><span className="num">6</span> Confirm</h2>
        <label className="check" data-field="attest_truthful">
          <input type="checkbox" checked={f.attest_truthful} onChange={(e) => set("attest_truthful", e.target.checked)} />
          <span>This story is true to what they told me, and the consent form was signed by the person in the story (or their legal guardian).</span>
        </label>
        {err("attest_truthful")}
        <label className="check" data-field="attest_guidelines">
          <input type="checkbox" checked={f.attest_guidelines} onChange={(e) => set("attest_guidelines", e.target.checked)} />
          <span>I followed The Forgotten&rsquo;s <Link href="/get-involved#guide" target="_blank">interview guidelines</Link>, and I understand the story will be reviewed and may be edited before it&rsquo;s published.</span>
        </label>
        {err("attest_guidelines")}

        <Turnstile onToken={setHumanToken} />
        <button className="btn btn-primary" type="submit" disabled={busy} style={{ marginTop: 10, minWidth: 220 }}>
          {status === "uploading" ? "Uploading files…" : status === "saving" ? "Saving…" : "Submit for review"}
        </button>
      </div>
    </form>
  );
}
