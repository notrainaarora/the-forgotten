import type { Metadata } from "next";
import "@fontsource/anton/400.css";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/instrument-sans/index.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description:
    "A youth-led storytelling initiative sharing the stories of veterans experiencing homelessness, seniors, and others too often reduced to statistics.",
  openGraph: { siteName: SITE.name, type: "website" },
  // Hidden from search engines until launch day (SITE_PRELAUNCH=1 in Vercel).
  robots: process.env.SITE_PRELAUNCH === "1" ? { index: false, follow: false } : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
