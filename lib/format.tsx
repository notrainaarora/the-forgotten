import type { ReactNode } from "react";
import { SUBJECT_TYPES } from "@/lib/constants";
import type { PublicStory } from "@/lib/types";

/**
 * Render a story body safely. Blank lines separate paragraphs; **bold** is
 * supported (used for interview questions). No raw HTML is ever rendered.
 */
export function renderBody(body: string): ReactNode {
  return body
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para, i) => (
      <p key={i}>
        {para.split("\n").map((line, j, arr) => (
          <span key={j}>
            {inline(line)}
            {j < arr.length - 1 && <br />}
          </span>
        ))}
      </p>
    ));
}

function inline(line: string): ReactNode[] {
  return line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}

export function subjectLabel(s: Pick<PublicStory, "subject_type" | "subject_type_other">) {
  if (s.subject_type === "other" && s.subject_type_other) return s.subject_type_other;
  return SUBJECT_TYPES.find((t) => t.value === s.subject_type)?.label ?? s.subject_type;
}

export function placeLabel(s: Pick<PublicStory, "city" | "region" | "country">) {
  const parts = [s.city, s.region];
  if (s.country && s.country !== "United States") parts.push(s.country);
  return parts.filter(Boolean).join(", ");
}

export function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "story"
  );
}

/** Archive-style catalog number shown on cards and story pages, e.g. "TF-3A9C". */
export function fileNo(s: Pick<PublicStory, "id">) {
  const demo = s.id.match(/^demo-(\d+)$/);
  if (demo) return `TF-${demo[1].padStart(4, "0")}`;
  return `TF-${s.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
}
