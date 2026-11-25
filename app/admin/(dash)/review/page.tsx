import Link from "next/link";
import { listAdminStories, statusCounts } from "@/lib/admin-data";
import { formatDate } from "@/lib/format";
import { timeAgo } from "@/lib/time";
import type { StoryStatus } from "@/lib/types";
import { approveStory } from "../../actions";

type SP = Promise<{ status?: string; q?: string; deleted?: string }>;
const TABS: { key: StoryStatus | "all"; label: string }[] = [
  { key: "pending", label: "Needs review" },
  { key: "approved", label: "Published" },
  { key: "rejected", label: "Not published" },
  { key: "withdrawn", label: "Withdrawn" },
  { key: "all", label: "All" },
];

export default async function Review({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const status = (TABS.find((t) => t.key === sp.status)?.key ?? "pending") as StoryStatus | "all";
  const [stories, counts] = await Promise.all([listAdminStories(status, sp.q), statusCounts()]);

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Review queue</h1>
          <p>Open a story to check its consent form, edit it, and publish. Oldest submissions are shown first.</p>
        </div>
      </div>
      {sp.deleted && <div className="notice notice-ok">Story deleted.</div>}
      <div className="toolbar">
        <nav className="tabs" style={{ margin: 0 }}>
          {TABS.map((t) => (
            <Link key={t.key} href={`/admin/review?status=${t.key}`} className={t.key === status ? "on" : ""}>
              {t.label}{t.key !== "all" ? ` · ${counts[t.key]}` : ""}
            </Link>
          ))}
        </nav>
        <form method="get" style={{ marginLeft: "auto" }}>
          <input type="hidden" name="status" value={status} />
          <input type="search" name="q" defaultValue={sp.q} placeholder="Search title, person, contributor…" />
        </form>
      </div>
      {stories.length === 0 ? (
        <div className="empty">{status === "pending" ? "All caught up. Nothing is waiting for review." : "Nothing here."}</div>
      ) : (
        <div className="table-wrap">
          <table className="admin">
            <thead><tr><th>Story</th><th>Person</th><th>Contributor</th><th>Submitted</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {stories.map((s) => (
                <tr key={s.id}>
                  <td><Link href={`/admin/stories/${s.id}`}><strong>{s.title}</strong></Link>{s.featured && <span className="tag" style={{ marginLeft: 8 }}>Featured</span>}</td>
                  <td>{s.subject_display_name}<div className="muted" style={{ fontSize: 13 }}>{s.subject_type} · {s.region}</div></td>
                  <td>{s.contributor_name}<div className="muted" style={{ fontSize: 13 }}>{s.contributor_age_group}{s.contributor_school ? ` · ${s.contributor_school}` : ""}</div></td>
                  <td title={formatDate(s.created_at)}>{timeAgo(s.created_at)}</td>
                  <td><span className={`status status-${s.status}`}>{s.status}</span></td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/admin/stories/${s.id}`} className="btn btn-outline btn-small">Open</Link>
                      {s.status === "pending" && (
                        <form action={approveStory}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="back" value="/admin/review" />
                          <button className="btn btn-ok btn-small" title="Only after checking the consent form">Approve</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {status === "pending" && stories.length > 0 && (
        <p className="muted" style={{ fontSize: 14, marginTop: 12 }}>Tip: open each story to check the signed consent form before approving.</p>
      )}
    </>
  );
}
