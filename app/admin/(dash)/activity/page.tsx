import { requireOwner } from "@/lib/admin";
import { listActivity } from "@/lib/admin-data";
import { timeAgo } from "@/lib/time";

export default async function ActivityPage() {
  await requireOwner();
  const items = await listActivity(300);
  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Activity log</h1>
          <p>Everything that&rsquo;s happened: submissions, sign-ups, approvals, edits, and team changes.</p>
        </div>
        <a href="/admin/export/activity" className="btn btn-outline btn-small">Download (.csv)</a>
      </div>
      <div className="card">
        {items.length ? (
          <ul className="feed">
            {items.map((a) => (
              <li key={a.id}>
                <span className={`dot ${a.action.split(".")[0]}`} />
                <span>{a.summary}<div className="who">{a.action}{a.actor_email ? ` · by ${a.actor_email}` : ""}</div></span>
                <span className="when" title={new Date(a.created_at).toLocaleString()}>{timeAgo(a.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : <p className="muted">Nothing yet.</p>}
      </div>
    </>
  );
}
