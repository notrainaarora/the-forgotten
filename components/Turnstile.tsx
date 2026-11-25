"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void } }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Renders Cloudflare's "are you human" check when configured; otherwise renders nothing. */
export default function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    const el = ref.current;
    const render = () => window.turnstile?.render(el, { sitekey: SITE_KEY, callback: onToken, "expired-callback": () => onToken("") });
    if (window.turnstile) { render(); return; }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [onToken]);
  if (!SITE_KEY) return null;
  return <div ref={ref} style={{ margin: "12px 0" }} />;
}
