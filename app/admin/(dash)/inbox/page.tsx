import Link from "next/link";
import { listWithdrawals } from "@/lib/admin-data";
import { timeAgo } from "@/lib/time";
import { resolveWithdrawal, setStatus } from "../../actions";

export default async function Inbox() {
  const withdrawals = await listWithdrawals();
  const open = withdrawals.filter((w) => w.status === "open").length;
  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Withdrawal requests</h1>
          <p>People asking to change or remove a story. {open ? `${open} open. Handle these first.` : "Nothing open."}</p>
        </div>
      </div>
      {withdrawals.length === 0 ? <div className="empty">No requests yet.</div> : (
        <div className="table-wrap">
          <table className="admin">
            <thead><tr><th>Story</th><th>From</th><th>Request</th><th>Received</th><th>Action</th></tr></thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} style={{ opacity: w.status === "open" ? 1 : 0.55 }}>
                  <td>{w.stories ? <Link href={`/admin/stories/${w.stories.id}`}>{w.stories.title}</Link> : w.story_reference}
                    {w.stories && <div><span className={`status status-${w.stories.status}`}>{w.stories.status}</span></div>}</td>
                  <td>{w.requester_name}<div className="muted" style={{ fontSize: 13 }}>{w.relationship} · <a href={`mailto:${w.requester_email}`}>{w.requester_email}</a></div></td>
                  <td style={{ maxWidth: 320 }}>{w.reason || <span className="muted">No details given</span>}</td>
                  <td>{timeAgo(w.created_at)}</td>
                  <td>
                    <div className="row-actions" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                      {w.stories && w.stories.status === "approved" && (
                        <form action={setStatus}><input type="hidden" name="id" value={w.stories.id} /><input type="hidden" name="status" value="withdrawn" /><input type="hidden" name="back" value="/admin/inbox" /><button className="btn btn-danger btn-small">Take story down</button></form>
                      )}
                      {w.status === "open" ? (
                        <>
                          <form action={resolveWithdrawal}><input type="hidden" name="id" value={w.id} /><input type="hidden" name="status" value="done" /><button className="btn btn-ok btn-small">Mark done</button></form>
                          <form action={resolveWithdrawal}><input type="hidden" name="id" value={w.id} /><input type="hidden" name="status" value="declined" /><button className="btn btn-outline btn-small">Close without change</button></form>
                        </>
                      ) : (
                        <form action={resolveWithdrawal}><input type="hidden" name="id" value={w.id} /><input type="hidden" name="status" value="open" /><button className="btn btn-outline btn-small">Reopen ({w.status})</button></form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
