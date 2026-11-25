import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

// While SITE_PRELAUNCH=1 (set in Vercel), search engines are asked to stay away
// entirely. Remove that variable on launch day to let Google in.
export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_PRELAUNCH === "1") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/auth"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
