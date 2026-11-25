"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Counts = { pending: number; withdrawals: number; signups: number };

export default function DashNav({ owner, counts }: { owner: boolean; counts: Counts }) {
  const path = usePathname();
  const on = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  const item = (href: string, label: string, count?: number) => (
    <Link key={href} href={href} className={`dash-link${on(href) ? " on" : ""}`}>
      <span>{label}</span>
      {count ? <span className="count">{count}</span> : null}
    </Link>
  );
  return (
    <>
      <div className="dash-group">Stories</div>
      {item("/admin", "Overview")}
      {item("/admin/review", "Review queue", counts.pending)}
      {item("/admin/inbox", "Withdrawal requests", counts.withdrawals)}
      {owner && (
        <>
          <div className="dash-group">People</div>
          {item("/admin/contributors", "Contributors & sign-ups", counts.signups)}
          {item("/admin/team", "Review team")}
          <div className="dash-group">Records</div>
          {item("/admin/activity", "Activity log")}
          {item("/admin/exports", "Downloads")}
        </>
      )}
      <div className="dash-group">Site</div>
      <Link href="/" className="dash-link" target="_blank">View public site ↗</Link>
    </>
  );
}
