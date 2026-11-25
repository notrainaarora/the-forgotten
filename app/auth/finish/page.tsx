"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

// Sign-in links land here with the session in the URL fragment (#access_token=…).
// Because nothing is stored in the browser beforehand, the link works in any
// browser or device, not just the one where it was requested.
export default function FinishSignIn() {
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const error = hash.get("error_description");
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (error || !access_token || !refresh_token) {
      setMessage(error ? `${error}. Request a new link.` : "That link is missing its sign-in details. Request a new link.");
      return;
    }
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    supabase.auth.setSession({ access_token, refresh_token }).then(({ error: e }) => {
      if (e) setMessage("That link expired or was already used. Request a new link.");
      else window.location.replace("/admin");
    });
  }, []);

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h2 style={{ fontFamily: "var(--display)", fontWeight: 400, textTransform: "uppercase", fontSize: 36, color: "var(--burgundy)", margin: "0 0 12px" }}>
          Team sign in
        </h2>
        <p>{message}</p>
        {!message.startsWith("Signing") && <a className="btn btn-primary" href="/admin/login">Get a new link</a>}
      </div>
    </div>
  );
}
