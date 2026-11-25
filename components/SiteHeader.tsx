import Link from "next/link";
import { isConfigured } from "@/lib/supabase";
import { LogoMark } from "@/components/Logo";

const links = [
  { href: "/stories", label: "The Archive" },
  { href: "/about", label: "About" },
  { href: "/get-involved", label: "Get Involved" },
];

export default function SiteHeader() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      {!isConfigured && (
        <div className="demo-banner" role="note">Preview mode: sample stories shown, forms don&rsquo;t save yet</div>
      )}
      <header className="site-header">
        <div className="wrap">
          <Link href="/" className="brand" aria-label="The Forgotten, home">
            <LogoMark size={30} /> The Forgotten
          </Link>
          <nav className="nav" aria-label="Main">
            {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
            <Link href="/share" className="nav-cta">Share a story →</Link>
          </nav>
        </div>
      </header>
      <div className="flag-rule" aria-hidden><span /><span /><span /></div>
    </>
  );
}
