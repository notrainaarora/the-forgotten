import { requireOwner } from "@/lib/admin";
import { listTeam } from "@/lib/admin-data";
import { formatDate } from "@/lib/format";
import { changeRole, inviteMember, removeMember } from "../../actions";

type SP = Promise<{ saved?: string; error?: string }>;

export default async function Team({ searchParams }: { searchParams: SP }) {
  const me = await requireOwner();
  const sp = await searchParams;
  const team = await listTeam();
  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Review team</h1>
          <p>Who can sign in to this dashboard.</p>
        </div>
      </div>
      {sp.saved && <div className="notice notice-ok">{sp.saved === "invited" ? "Invitation sent. They'll get an email with a sign-in link." : "Saved."}</div>}
      {sp.error && <div className="notice notice-err">{sp.error}</div>}

      <div className="cards-2">
        <div className="table-wrap">
          <table className="admin">
            <thead><tr><th>Member</th><th>Role</th><th>Added</th><th></th></tr></thead>
            <tbody>
              {team.map((m) => (
                <tr key={m.user_id}>
                  <td><strong>{m.display_name || m.email}</strong>{m.display_name && <div className="muted" style={{ fontSize: 13 }}>{m.email}</div>}{m.user_id === me.id && <div className="mono muted" style={{ fontSize: 11 }}>You</div>}</td>
                  <td><span className={`status pill-${m.role}`}>{m.role}</span></td>
                  <td>{formatDate(m.created_at)}</td>
                  <td>
                    {m.user_id !== me.id && (
                      <div className="row-actions">
                        <form action={changeRole}><input type="hidden" name="user_id" value={m.user_id} /><input type="hidden" name="role" value={m.role === "owner" ? "reviewer" : "owner"} /><button className="btn btn-outline btn-small">Make {m.role === "owner" ? "reviewer" : "owner"}</button></form>
                        <form action={removeMember}><input type="hidden" name="user_id" value={m.user_id} /><button className="btn btn-danger btn-small">Remove</button></form>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Add someone</h3>
          <form action={inviteMember}>
            <div className="field"><label htmlFor="em">Email</label><input id="em" name="email" type="email" required /></div>
            <div className="field"><label htmlFor="dn">Name <span className="muted">(optional)</span></label><input id="dn" name="display_name" type="text" placeholder="e.g. Raina" /></div>
            <div className="field">
              <label htmlFor="rl">Role</label>
              <select id="rl" name="role" defaultValue="reviewer">
                <option value="reviewer">Reviewer: approves stories, handles withdrawals</option>
                <option value="owner">Owner: everything, including contacts and the team</option>
              </select>
            </div>
            <button className="btn btn-primary btn-small">Send invitation</button>
          </form>
          <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>
            Reviewers can&rsquo;t see the sign-up list, download data, delete stories, or manage the team.
          </p>
        </div>
      </div>
    </>
  );
}
