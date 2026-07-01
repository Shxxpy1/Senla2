import type { ReactNode } from "react";
import { SessionPreviewCard } from "./SessionPreviewCard";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
      }}
      className="auth-layout"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
          padding: "64px 72px",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              color: "#6C8CFF",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 0.4,
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: "linear-gradient(135deg, #6C8CFF, #8EA6FF)",
                display: "inline-block",
              }}
            />
            Task Tracker
          </div>
          <h1
            className="heading-font"
            style={{ fontSize: 38, color: "#EDF1FA", margin: 0, lineHeight: 1.2 }}
          >
            {title}
          </h1>
          <p style={{ color: "#93A0C2", fontSize: 16, maxWidth: 420, marginTop: 12 }}>
            {subtitle}
          </p>
        </div>

        <SessionPreviewCard />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B1220",
          borderLeft: "1px solid #1E2A47",
          padding: 24,
        }}
      >
        <div style={{ width: "100%", maxWidth: 380 }} className="fade-rise">
          {children}
        </div>
      </div>
    </div>
  );
}
