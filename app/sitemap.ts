import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { listStories } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await listStories({}, 1000);
  const pages = ["", "/stories", "/about", "/get-involved", "/share", "/consent-form", "/privacy"].map((p) => ({
    url: `${SITE.url}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  return [
    ...pages,
    ...stories.map((s) => ({ url: `${SITE.url}/stories/${s.slug}`, lastModified: s.published_at ?? undefined, priority: 0.8 })),
  ];
}
