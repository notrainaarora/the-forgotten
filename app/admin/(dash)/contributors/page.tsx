import Link from "next/link";
import { requireOwner } from "@/lib/admin";
import { listContributors, listSignups } from "@/lib/admin-data";
import { formatDate } from "@/lib/format";
import { timeAgo } from "@/lib/time";
import { markSignupHandled } from "../../actions";

type SP = Promise<{ tab?: string }>;

export default async function Contributors({ searchParams }: { searchParams: SP }) {
  await requireOwner();
  const tab = (await searchParams).tab === "signups" ? "signups" : "contributors";
  const [contributors, signups] = await Promise.all([listContributors(), listSignups()]);
  const newSignups = signups.filter((s) => !s.handled).length;

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Contributors</h1>
          <p>Every teen who has submitted a story or signed up. Contact details are visible only to owners.</p>
        </div>
        <div className="row-actions">
          <a href="/admin/export/contributors" className="btn btn-outline btn-small">Download contributors (.csv)</a>
          <a href="/admin/export/signups" className="btn btn-outline btn-small">Download sign-ups (.csv)</a>
        </div>
      </div>
      <nav className="tabs">
        <Link href="/admin/contributors" className={tab === "contributors" ? "on" : ""}>All contributors · {contributors.length}</Link>
        <Link href="/admin/contributors?tab=signups" className={tab === "signups" ? "on" : ""}>Sign-ups{newSignups ? ` · ${newSignups} new` : ""}</Link>
      </nav>

      {tab === "contributors" ? (
        contributors.length === 0 ? <div className="empty">No contributors yet.</div> : (
          <div className="table-wrap">
            <table className="admin">
              <thead><tr><th>Name</th><th>School / place</th><th>Age</th><th>Stories</th><th>Last active</th></tr></thead>
              <tbody>
                {contributors.map((c) => (
                  <tr key={c.email}>
                    <td><strong>{c.name}</strong><div className="muted" style={{ fontSize: 13 }}><a href={`mailto:${c.email}`}>{c.email}</a></div></td>
                    <td>{[c.school, c.region].filter(Boolean).join(" · ") || <span className="muted">—</span>}</td>
                    <td>{c.age ?? "—"}</td>
                    <td>{c.total ? <>{c.published} published{c.pending ? `, ${c.pending} waiting` : ""}<div className="muted" style={{ fontSize: 13 }}>{c.total} submitted</div></> : <span className="muted">Signed up, no stories yet</span>}</td>
                    <td>{timeAgo(c.last)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : signups.length === 0 ? <div className="empty">No sign-ups yet.</div> : (
        <div className="table-wrap">
          <table className="admin">
            <thead><tr><th>Name</th><th>Where</th><th>Interests</th><th>Message</th><th>Signed up</th><th></th></tr></thead>
            <tbody>
              {signups.map((s) => (
                <tr key={s.id} style={{ opacity: s.handled ? 0.55 : 1 }}>
                  <td><strong>{s.name}</strong><div className="muted" style={{ fontSize: 13 }}><a href={`mailto:${s.email}`}>{s.email}</a> · {s.age_group}</div>
                    {s.guardian_email && <div className="muted" style={{ fontSize: 13 }}>Guardian: <a href={`mailto:${s.guardian_email}`}>{s.guardian_email}</a></div>}</td>
                  <td>{[s.school, s.city, s.region].filter(Boolean).join(" · ")}</td>
                  <td>{(s.interests ?? []).join(", ")}</td>
                  <td style={{ maxWidth: 260 }}>{s.message}</td>
                  <td title={formatDate(s.created_at)}>{timeAgo(s.created_at)}</td>
                  <td><form action={markSignupHandled}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="handled" value={s.handled ? "0" : "1"} /><button className="btn btn-outline btn-small">{s.handled ? "Undo" : "Mark contacted"}</button></form></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
