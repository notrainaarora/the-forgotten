import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getOverview, statusCounts } from "@/lib/admin-data";
import { getThemes } from "@/lib/data";
import { SUBJECT_TYPES } from "@/lib/constants";
import { timeAgo } from "@/lib/time";

type SP = Promise<{ denied?: string; demo?: string }>;

export default async function Overview({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const me = await requireAdmin();
  const [o, c, themes] = await Promise.all([getOverview(), statusCounts(), getThemes()]);
  const maxWeek = Math.max(1, ...o.weeks.map((w) => w.count));
  const first = (me.name || me.email).split(/[ @]/)[0];

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Overview</h1>
          <p>Welcome back, {first}. Here&rsquo;s everything happening on The Forgotten.</p>
        </div>
        <div className="row-actions">
          <Link href="/admin/review" className="btn btn-primary btn-small arrow">Review stories</Link>
          {me.role === "owner" && <Link href="/admin/exports" className="btn btn-outline btn-small">Downloads</Link>}
        </div>
      </div>
      {sp.denied && <div className="notice notice-err">That page is only available to the owner.</div>}
      {sp.demo && <div className="notice notice-warn">Preview mode is read-only. Connect the database to make changes.</div>}

      <div className="kpis">
        <Link href="/admin/review" className={`kpi${c.pending ? " alert" : ""}`}>
          <div className="k-label">Waiting for review</div>
          <div className="k-num">{c.pending}</div>
          <div className="k-sub">{c.pending ? `Oldest waiting ${o.oldestPendingDays} day${o.oldestPendingDays === 1 ? "" : "s"}` : "All caught up"}</div>
        </Link>
        <Link href="/admin/review?status=approved" className="kpi">
          <div className="k-label">Published stories</div>
          <div className="k-num">{o.totals.published}</div>
          <div className="k-sub">{o.totals.states} state{o.totals.states === 1 ? "" : "s"} represented</div>
        </Link>
        <Link href={me.role === "owner" ? "/admin/contributors" : "/admin"} className="kpi">
          <div className="k-label">Contributors</div>
          <div className="k-num">{o.totals.contributors}</div>
          <div className="k-sub">from {o.totals.schools} school{o.totals.schools === 1 ? "" : "s"} · {c.signups} new sign-up{c.signups === 1 ? "" : "s"}</div>
        </Link>
        <Link href="/admin/inbox" className={`kpi${c.withdrawals ? " alert" : ""}`}>
          <div className="k-label">Withdrawal requests</div>
          <div className="k-num">{c.withdrawals}</div>
          <div className="k-sub">{c.withdrawals ? "Handle these first" : "None open"}</div>
        </Link>
      </div>

      <div className="cards-2">
        <div className="card">
          <h3><span>Submissions per week</span><span>Last 12 weeks</span></h3>
          <div className="bars">
            {o.weeks.map((w) => (
              <div className="b" key={w.label} title={`${w.count} submitted week of ${w.label}`}>
                <span className="v">{w.count || ""}</span>
                <i style={{ height: `${(w.count / maxWeek) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="bars-x">{o.weeks.map((w, i) => <span key={w.label}>{i % 2 === 1 ? w.label : ""}</span>)}</div>
        </div>
        <div className="card">
          <h3><span>Recent activity</span>{me.role === "owner" && <Link href="/admin/activity">See all →</Link>}</h3>
          {o.activity.length ? (
            <ul className="feed">
              {o.activity.slice(0, 6).map((a) => (
                <li key={a.id}>
                  <span className={`dot ${a.action.split(".")[0]}`} />
                  <span>{a.summary}{a.actor_email && <div className="who">by {a.actor_email}</div>}</span>
                  <span className="when">{timeAgo(a.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="muted">Nothing yet. Activity shows up here as stories come in.</p>}
        </div>
      </div>

      <div className="cards-3">
        <Breakdown title="Published by who" rows={o.bySubject.map(([k, n]) => [SUBJECT_TYPES.find((t) => t.value === k)?.label ?? k, n])} />
        <Breakdown title="Top states" rows={o.byRegion} />
        <Breakdown title="Top themes" rows={o.byTheme.map(([k, n]) => [themes.find((t) => t.slug === k)?.label ?? k, n])} />
      </div>

      <div className="cards-3">
        <div className="card">
          <h3>Status of every story</h3>
          <div className="hbar"><span className="t">Published</span><span className="track"><span className="fill" style={{ width: pct(c.approved, o.totals.stories), background: "var(--ok)", display: "block" }} /></span><span className="n">{c.approved}</span></div>
          <div className="hbar"><span className="t">Waiting</span><span className="track"><span className="fill" style={{ width: pct(c.pending, o.totals.stories), background: "#b07d1a", display: "block" }} /></span><span className="n">{c.pending}</span></div>
          <div className="hbar"><span className="t">Not published</span><span className="track"><span className="fill" style={{ width: pct(c.rejected, o.totals.stories), background: "#999", display: "block" }} /></span><span className="n">{c.rejected}</span></div>
          <div className="hbar"><span className="t">Withdrawn</span><span className="track"><span className="fill" style={{ width: pct(c.withdrawn, o.totals.stories), display: "block" }} /></span><span className="n">{c.withdrawn}</span></div>
        </div>
        <div className="card">
          <h3>The book (Phase 3)</h3>
          <div className="k-num" style={{ fontFamily: "var(--display)", fontSize: 54, lineHeight: 1, color: "var(--navy)" }}>{o.totals.bookReady}</div>
          <p className="muted" style={{ margin: "6px 0 0" }}>published stories whose subject agreed to appear in the coffee table book.</p>
        </div>
        <div className="card">
          <h3>Quick links</h3>
          <div style={{ display: "grid", gap: 8 }}>
            <Link href="/share" target="_blank">Submission form ↗</Link>
            <Link href="/consent-form" target="_blank">Printable consent form ↗</Link>
            <Link href="/get-involved#guide" target="_blank">Interview guide ↗</Link>
            <Link href="/stories" target="_blank">Public archive ↗</Link>
          </div>
        </div>
      </div>
    </>
  );
}

const pct = (n: number, total: number) => `${total ? Math.round((n / total) * 100) : 0}%`;

function Breakdown({ title, rows }: { title: string; rows: (readonly [string, number])[] | [string, number][] }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="card">
      <h3>{title}</h3>
      {rows.length === 0 ? <p className="muted">No published stories yet.</p> : rows.map(([label, n]) => (
        <div className="hbar" key={label}>
          <span className="t" title={label}>{label}</span>
          <span className="track"><span className="fill" style={{ width: `${(n / max) * 100}%`, display: "block" }} /></span>
          <span className="n">{n}</span>
        </div>
      ))}
    </div>
  );
}
