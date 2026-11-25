"use client";
import { useState } from "react";
import { useJsonForm } from "@/components/useJsonForm";
import Turnstile from "@/components/Turnstile";

export default function WithdrawForm() {
  const { errors, message, state, demo, submit } = useJsonForm("/api/withdraw");
  const [f, setF] = useState({ website: "", story_reference: "", requester_name: "", requester_email: "", relationship: "", reason: "" });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  const [humanToken, setHumanToken] = useState("");
  const err = (k: string) => errors[k] && <div className="error">{errors[k]}</div>;

  if (state === "done")
    return (
      <div className="notice notice-ok">
        <strong>We&rsquo;ve received your request.</strong> WeWe&rsquo;ll take the story down while we review it and confirm by email at {f.requester_email}.rsquo;ll act on it promptly and confirm by email at {f.requester_email}.
        {demo && <div style={{ marginTop: 6 }}>(Preview mode: nothing was saved.)</div>}
      </div>
    );

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit({ ...f, turnstile_token: humanToken }); }} noValidate>
      {message && <div className="notice notice-err" role="alert">{message}</div>}
      <div className="honeypot" aria-hidden><input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} /></div>
      <div className="field"><label htmlFor="w-ref">Which story?</label><p className="hint">Paste the link, or tell us the title or the person&rsquo;s name.</p><input id="w-ref" type="text" value={f.story_reference} onChange={(e) => set("story_reference", e.target.value)} />{err("story_reference")}</div>
      <div className="row">
        <div className="field"><label htmlFor="w-name">Your name</label><input id="w-name" type="text" value={f.requester_name} onChange={(e) => set("requester_name", e.target.value)} />{err("requester_name")}</div>
        <div className="field"><label htmlFor="w-email">Your email</label><input id="w-email" type="email" value={f.requester_email} onChange={(e) => set("requester_email", e.target.value)} />{err("requester_email")}</div>
      </div>
      <div className="field"><label htmlFor="w-rel">You are&hellip;</label>
        <select id="w-rel" value={f.relationship} onChange={(e) => set("relationship", e.target.value)}>
          <option value="">Choose one</option>
          <option value="subject">The person in the story</option>
          <option value="family">A family member or guardian</option>
          <option value="contributor">The contributor who wrote it</option>
          <option value="other">Someone else</option>
        </select>{err("relationship")}
      </div>
      <div className="field"><label htmlFor="w-reason">What would you like us to do? <span className="muted">(optional)</span></label><p className="hint">Remove it entirely, change a detail, swap a photo&hellip; You don&rsquo;t have to give a reason.</p><textarea id="w-reason" value={f.reason} onChange={(e) => set("reason", e.target.value)} /></div>
      <Turnstile onToken={setHumanToken} />
      <button className="btn btn-primary" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send request"}</button>
    </form>
  );
}
