"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0a0f", color: "#f5f5fa", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
          <div style={{ maxWidth: 520 }}>
            <p style={{ color: "#a998ff", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase" }}>PathPilot recovery</p>
            <h1 style={{ marginTop: 12, fontSize: 30 }}>The application shell could not load.</h1>
            <p style={{ color: "#a3a3b8", lineHeight: 1.6 }}>Your saved browser data has not been removed. Reload the shell to continue.</p>
            <button type="button" onClick={reset} style={{ marginTop: 20, minHeight: 44, border: 0, borderRadius: 10, padding: "0 20px", background: "#7c5cfc", color: "white", fontWeight: 600, cursor: "pointer" }}>Reload PathPilot</button>
          </div>
        </main>
      </body>
    </html>
  );
}
