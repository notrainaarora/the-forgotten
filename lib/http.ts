import "server-only";
import { NextResponse } from "next/server";

// Best-effort per-instance rate limit. Good enough to blunt casual spam;
// add Cloudflare Turnstile if the forms start getting abused.
const hits = new Map<string, number[]>();
export function rateLimited(req: Request, key: string, max = 10, windowMs = 10 * 60 * 1000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(id, recent);
  return recent.length > max;
}

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
