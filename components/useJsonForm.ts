"use client";
import { useState } from "react";

/** Small helper for the simple public forms. */
export function useJsonForm(endpoint: string) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [demo, setDemo] = useState(false);

  async function submit(payload: unknown) {
    setState("sending");
    setMessage("");
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then((r) => r.json());
      if (!res.ok) {
        setErrors(res.fields ?? {});
        setMessage(res.error ?? "Something went wrong.");
        setState("idle");
        return;
      }
      setErrors({});
      setDemo(Boolean(res.demo));
      setState("done");
    } catch {
      setMessage("Network problem. Please try again.");
      setState("idle");
    }
  }
  return { errors, message, state, demo, submit };
}
