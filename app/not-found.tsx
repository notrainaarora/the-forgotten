import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <div className="page-head">
          <div className="wrap">
            <p className="eyebrow">Error 404</p>
            <h1>Page not found</h1>
            <p>This page doesn&rsquo;t exist, or a story may have been withdrawn at the request of the person who shared it.</p>
          </div>
        </div>
        <section>
          <div className="wrap hero-actions">
            <Link href="/" className="btn btn-dark">Home</Link>
            <Link href="/stories" className="btn btn-primary arrow">The archive</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
