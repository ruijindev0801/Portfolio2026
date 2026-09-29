import { ImageResponse } from "next/og";
import { displayHost } from "@/lib/format";
import { info } from "@/lib/info";

// Social preview card (LinkedIn, X, Slack, iMessage…), rendered at build time from info.json.
// A route with a real ".png" name, so every static host serves it as an image.
export const dynamic = "force-static";

export function GET() {
  const { profile, settings } = info;
  const subtitle = [profile.headline, profile.location].filter(Boolean).join(" · ");

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 80,
        background: "#ffffff",
        color: "#0a0a0a",
      }}
    >
      <div style={{ fontSize: 28, color: "#666666" }}>{displayHost(settings.siteUrl)}</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 88, letterSpacing: "-0.04em", lineHeight: 1.05 }}>{profile.name}</div>
        <div style={{ marginTop: 20, fontSize: 38, color: "#666666" }}>{subtitle}</div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
