"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h2 style={{ fontFamily: "var(--display)", fontWeight: 400, textTransform: "uppercase", fontSize: 40, lineHeight: 1, color: "var(--burgundy)", margin: "0 0 12px" }}>Something went wrong</h2>
        <p className="muted">Sorry about that. Please try again in a moment.</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={reset}>Try again</button>
          <a className="btn btn-outline" href="/">Home</a>
        </div>
      </div>
    </div>
  );
}
