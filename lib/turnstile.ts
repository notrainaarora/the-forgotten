import "server-only";

// Cloudflare Turnstile (free, privacy-friendly CAPTCHA alternative). Optional:
// only enforced when TURNSTILE_SECRET_KEY is set.
export async function verifyHuman(token: unknown, req: Request): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim();
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
