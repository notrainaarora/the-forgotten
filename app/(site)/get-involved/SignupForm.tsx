"use client";
import { useState } from "react";
import { useJsonForm } from "@/components/useJsonForm";
import Turnstile from "@/components/Turnstile";

const INTERESTS = [
  { value: "interview", label: "Interview people" },
  { value: "write", label: "Write & edit" },
  { value: "photograph", label: "Photograph" },
  { value: "chapter", label: "Start a chapter at my school" },
  { value: "partner", label: "Connect an organization" },
  { value: "other", label: "Something else" },
];

export default function SignupForm() {
  const { errors, message, state, demo, submit } = useJsonForm("/api/signup");
  const [f, setF] = useState({ website: "", name: "", email: "", age_group: "", age_13_plus: false, school: "", city: "", region: "", guardian_email: "", message: "" });
  const [interests, setInterests] = useState<string[]>([]);
  const set = (k: keyof typeof f, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));
  const [humanToken, setHumanToken] = useState("");
  const err = (k: string) => errors[k] && <div className="error">{errors[k]}</div>;

  if (state === "done")
    return (
      <div className="notice notice-ok">
        <strong>You&rsquo;re on the list!</strong> We&rsquo;ll be in touch at {f.email} with next steps.
        {demo && <div style={{ marginTop: 6 }}>(Preview mode: nothing was saved.)</div>}
      </div>
    );

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit({ ...f, interests, turnstile_token: humanToken }); }} noValidate>
      {message && <div className="notice notice-err" role="alert">{message}</div>}
      <div className="honeypot" aria-hidden><input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} /></div>
      <div className="row">
        <div className="field"><label htmlFor="s-name">Name</label><input id="s-name" type="text" value={f.name} onChange={(e) => set("name", e.target.value)} />{err("name")}</div>
        <div className="field"><label htmlFor="s-email">Email</label><input id="s-email" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} />{err("email")}</div>
      </div>
      <div className="row-3">
        <div className="field"><label htmlFor="s-school">School</label><input id="s-school" type="text" value={f.school} onChange={(e) => set("school", e.target.value)} /></div>
        <div className="field"><label htmlFor="s-city">City</label><input id="s-city" type="text" value={f.city} onChange={(e) => set("city", e.target.value)} /></div>
        <div className="field"><label htmlFor="s-region">State / region</label><input id="s-region" type="text" value={f.region} onChange={(e) => set("region", e.target.value)} /></div>
      </div>
      <div className="field">
        <span className="label">Your age</span>
        <div className="chips">
          {(["13-17", "18+"] as const).map((a) => (
            <label key={a} className={`chip ${f.age_group === a ? "on" : ""}`}>
              <input type="radio" name="s-age" checked={f.age_group === a} onChange={() => set("age_group", a)} />
              {a === "13-17" ? "13 to 17" : "18 or older"}
            </label>
          ))}
        </div>
        {err("age_group")}
      </div>
      <label className="check"><input type="checkbox" checked={f.age_13_plus} onChange={(e) => set("age_13_plus", e.target.checked)} /><span>I am 13 or older.</span></label>
      {err("age_13_plus")}
      {f.age_group === "13-17" && (
        <div className="field"><label htmlFor="s-g">Parent/guardian email</label><p className="hint">We&rsquo;ll copy them on our welcome email.</p><input id="s-g" type="email" value={f.guardian_email} onChange={(e) => set("guardian_email", e.target.value)} />{err("guardian_email")}</div>
      )}
      <div className="field">
        <span className="label">I&rsquo;d like to&hellip;</span>
        <div className="chips">
          {INTERESTS.map((i) => (
            <label key={i.value} className={`chip ${interests.includes(i.value) ? "on" : ""}`}>
              <input type="checkbox" checked={interests.includes(i.value)} onChange={() => setInterests((c) => (c.includes(i.value) ? c.filter((x) => x !== i.value) : [...c, i.value]))} />
              {i.label}
            </label>
          ))}
        </div>
      </div>
      <div className="field"><label htmlFor="s-msg">Anything else? <span className="muted">(optional)</span></label><textarea id="s-msg" value={f.message} onChange={(e) => set("message", e.target.value)} /></div>
      <Turnstile onToken={setHumanToken} />
      <button className="btn btn-primary" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Sign me up"}</button>
    </form>
  );
}
