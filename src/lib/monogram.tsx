import { ImageResponse } from "next/og";
import { initials } from "./format";
import { info } from "./info";

/** Square monogram (black tile, white initials) — the site's favicon and Apple touch icon. */
export function monogram(px: number) {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#0a0a0a",
        color: "#ffffff",
        borderRadius: px * 0.22,
        fontSize: px * 0.46,
        letterSpacing: "-0.04em",
      }}
    >
      {initials(info.profile.name)}
    </div>,
    { width: px, height: px },
  );
}
