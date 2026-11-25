import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { statusCounts } from "@/lib/admin-data";
import { LogoMark } from "@/components/Logo";
import DashNav from "./DashNav";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const c = await statusCounts();
  const owner = me.role === "owner";
  return (
    <div className="dash">
      <aside className="dash-side">
        <Link href="/admin" className="dash-brand">
          <LogoMark size={30} />
          <span>The Forgotten<small>{owner ? "Owner dashboard" : "Review desk"}</small></span>
        </Link>
        <DashNav
          owner={owner}
          counts={{ pending: c.pending, withdrawals: c.withdrawals, signups: c.signups }}
        />
        <div className="dash-me">
          <div>{me.name || me.email}</div>
          <span className="role">{me.role}</span>
          {!me.demo ? (
            <form action={signOut}><button>Sign out</button></form>
          ) : (
            <div className="mono" style={{ fontSize: 10.5, color: "#ff8a80" }}>Preview mode · read only</div>
          )}
        </div>
      </aside>
      <main className="dash-main" id="main">
        {me.demo && <div className="notice notice-warn">Preview mode with sample data. Buttons are disabled until the database is connected.</div>}
        {children}
      </main>
    </div>
  );
}
