import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminStory } from "@/lib/admin-data";
import { getThemes } from "@/lib/data";
import { formatDate, subjectLabel } from "@/lib/format";
import { INTERVIEW_SETTINGS } from "@/lib/constants";
import { approveStory, deleteStory, setStatus, toggleFeatured, updateStory } from "../../../actions";
import { requireAdmin } from "@/lib/admin";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

const YesNo = ({ v }: { v: boolean }) => <span className={v ? "yes" : "no"}>{v ? "Yes" : "No"}</span>;

export default async function AdminStoryPage({ params, searchParams }: Props) {
  const me = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const [result, themes] = await Promise.all([getAdminStory(id), getThemes()]);
  if (!result) notFound();
  const { story: s, consentUrl, photos } = result;

  return (
    <>
      <div>
        <p className="mono"><Link href="/admin/review">← Back to review queue</Link></p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 36, letterSpacing: "-0.02em" }}>{s.title}</h1>
          <span className={`status status-${s.status}`}>{s.status}</span>
          {s.featured && <span className="tag">Featured</span>}
        </div>
        <p className="muted">Submitted {formatDate(s.created_at)}{s.published_at && s.status === "approved" ? ` · Published ${formatDate(s.published_at)}` : ""}</p>
        {sp.saved && (
          <div className="notice notice-ok">
            {sp.saved === "approved" ? "Published! The story is live on the site." : sp.saved === "withdrawn" ? "Taken down. It's no longer on the site." : sp.saved === "rejected" ? "Marked as not published." : sp.saved === "pending" ? "Moved back to review." : "Changes saved."}
          </div>
        )}
        {sp.error && <div className="notice notice-err">{sp.error}</div>}

        <div className="admin-grid">
          {/* Edit */}
          <form action={updateStory} className="panel">
            <input type="hidden" name="id" value={s.id} />
            <h3>Edit story</h3>
            <div className="field"><label>Title</label><input type="text" name="title" defaultValue={s.title} maxLength={140} required /></div>
            <div className="field"><label>Summary</label><textarea name="summary" defaultValue={s.summary} maxLength={400} style={{ minHeight: 80 }} required /></div>
            <div className="field"><label>Story</label><textarea name="body" className="tall" defaultValue={s.body} maxLength={20000} required /></div>
            <div className="field"><label>Pull quote</label><input type="text" name="pull_quote" defaultValue={s.pull_quote ?? ""} maxLength={280} /></div>
            <div className="row">
              <div className="field"><label>Name shown for the person</label><input type="text" name="subject_display_name" defaultValue={s.subject_display_name} required /></div>
              <div className="field"><label>Contributor credit</label><input type="text" name="contributor_credit" defaultValue={s.contributor_credit} required /></div>
            </div>
            <div className="row">
              <div className="field"><label>City / area</label><input type="text" name="city" defaultValue={s.city ?? ""} /></div>
              <div className="field"><label>State / region</label><input type="text" name="region" defaultValue={s.region} required /></div>
            </div>
            <div className="field">
              <span className="label">Themes</span>
              <div className="chips">
                {themes.map((t) => (
                  <label key={t.slug} className="check" style={{ marginRight: 14 }}>
                    <input type="checkbox" name="themes" value={t.slug} defaultChecked={s.themes.includes(t.slug)} /> <span>{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="field"><label>Private reviewer notes</label><textarea name="reviewer_notes" defaultValue={s.reviewer_notes ?? ""} style={{ minHeight: 80 }} /></div>
            <button className="btn btn-primary">Save changes</button>
          </form>

          {/* Side panels */}
          <div>
            <div className="panel">
              <h3>Decision</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {s.status !== "approved" && (
                  <form action={approveStory}><input type="hidden" name="id" value={s.id} /><button className="btn btn-ok" style={{ width: "100%" }}>Approve &amp; publish</button></form>
                )}
                {s.status === "approved" && (
                  <>
                    <Link className="btn btn-outline" href={`/stories/${s.slug}`} target="_blank">View live story ↗</Link>
                    <form action={toggleFeatured}><input type="hidden" name="id" value={s.id} /><button className="btn btn-outline" style={{ width: "100%" }}>{s.featured ? "Remove from homepage" : "Feature on homepage"}</button></form>
                  </>
                )}
                {s.status !== "rejected" && s.status !== "withdrawn" && (
                  <form action={setStatus}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="status" value="rejected" /><button className="btn btn-outline" style={{ width: "100%" }}>{s.status === "approved" ? "Unpublish" : "Don't publish"}</button></form>
                )}
                {s.status !== "withdrawn" && (
                  <form action={setStatus}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="status" value="withdrawn" /><button className="btn btn-danger" style={{ width: "100%" }}>Mark withdrawn (consent revoked)</button></form>
                )}
                {(s.status === "rejected" || s.status === "withdrawn") && (
                  <form action={setStatus}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="status" value="pending" /><button className="btn btn-outline" style={{ width: "100%" }}>Move back to review</button></form>
                )}
              </div>
            </div>

            <div className="panel">
              <h3>Consent</h3>
              <dl className="facts">
                <dt>Signed by</dt><dd>{s.consent_signed_by}</dd>
                <dt>Date</dt><dd>{s.consent_signed_on}</dd>
                <dt>Form</dt><dd>{consentUrl ? <a href={consentUrl} target="_blank" rel="noopener noreferrer">Open signed form ↗</a> : <span className="muted">Unavailable</span>}</dd>
                <dt>Real first name</dt><dd><YesNo v={s.consent_real_name} /></dd>
                <dt>Photos</dt><dd><YesNo v={s.consent_photos} /></dd>
                <dt>Book</dt><dd><YesNo v={s.consent_book} /></dd>
              </dl>
              <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>Check the form is signed, dated, and matches these choices before approving.</p>
            </div>

            <div className="panel">
              <h3>Person &amp; interview</h3>
              <dl className="facts">
                <dt>Shown as</dt><dd>{s.subject_display_name} ({subjectLabel(s)})</dd>
                {s.service_branch && (<><dt>Service</dt><dd>{s.service_branch}{s.service_era ? `, ${s.service_era}` : ""}</dd></>)}
                <dt>Place</dt><dd>{[s.city, s.region, s.country].filter(Boolean).join(", ")}</dd>
                <dt>Setting</dt><dd>{INTERVIEW_SETTINGS.find((x) => x.value === s.interview_setting)?.label ?? s.interview_setting}</dd>
                {s.partner_org && (<><dt>Partner</dt><dd>{s.partner_org}</dd></>)}
              </dl>
            </div>

            <div className="panel">
              <h3>Contributor (private)</h3>
              <dl className="facts">
                <dt>Name</dt><dd>{s.contributor_name}</dd>
                <dt>Email</dt><dd><a href={`mailto:${s.contributor_email}`}>{s.contributor_email}</a></dd>
                {s.contributor_school && (<><dt>School</dt><dd>{s.contributor_school}</dd></>)}
                <dt>Age</dt><dd>{s.contributor_age_group}</dd>
                {s.contributor_age_group === "13-17" && (
                  <>
                    <dt>Guardian</dt><dd>{s.guardian_name}<br /><a href={`mailto:${s.guardian_email}`}>{s.guardian_email}</a></dd>
                    <dt>Approved</dt><dd><YesNo v={s.guardian_approved} /></dd>
                  </>
                )}
              </dl>
            </div>

            {photos.length > 0 && (
              <div className="panel">
                <h3>Photos ({photos.length})</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {photos.map((p) => (
                    <figure key={p.id} style={{ margin: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.url && <img src={p.url} alt={p.alt_text ?? ""} style={{ borderRadius: 6 }} />}
                      <figcaption className="muted" style={{ fontSize: 13 }}>{p.caption || "No caption"}{!p.alt_text && " · missing description"}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}

            {me.role === "owner" && (
            <form action={deleteStory} className="panel" style={{ borderTop: "4px solid #8b1d1d" }}>
              <h3>Delete permanently</h3>
              <p className="muted" style={{ fontSize: 14 }}>Removes the story, its photos, and the consent form. This can&rsquo;t be undone.</p>
              <input type="hidden" name="id" value={s.id} />
              <div className="field"><input type="text" name="confirm" placeholder="Type DELETE to confirm" /></div>
              <button className="btn btn-danger btn-small">Delete forever</button>
            </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
