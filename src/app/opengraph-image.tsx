import { ImageResponse } from "next/og";

export const alt = "Anime Tracker — current anime release schedule";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background:
          "radial-gradient(circle at 78% 18%, #312e81 0%, #111827 42%, #07080d 100%)",
        color: "white",
        display: "flex",
        height: "100%",
        padding: "80px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            color: "#a5b4fc",
            display: "flex",
            fontSize: 28,
            letterSpacing: 5,
            textTransform: "uppercase",
          }}
        >
          Anime Tracker
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.05,
            maxWidth: 880,
          }}
        >
          Follow every episode this season.
        </div>
        <div style={{ color: "#cbd5e1", display: "flex", fontSize: 30 }}>
          Weekly schedules · local release times · live AniList data
        </div>
      </div>
    </div>,
    size,
  );
}
