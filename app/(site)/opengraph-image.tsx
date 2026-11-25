import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

// The preview card shown when the site is shared on social media or in texts.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "The Forgotten: honoring the veterans our communities overlook";

const font = (file: string) => readFile(path.join(process.cwd(), "node_modules/@fontsource", file));

export default async function OG() {
  const [anton, mono] = await Promise.all([
    font("anton/files/anton-latin-400-normal.woff"),
    font("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff"),
  ]);
  const stripes = Array.from({ length: 7 }, (_, i) => i);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#eee8dd" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 70px", flex: 1 }}>
          <div style={{ display: "flex", fontFamily: "Mono", fontSize: 22, letterSpacing: 4, color: "#6b1726" }}>A YOUTH-LED STORYTELLING INITIATIVE</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontFamily: "Anton", fontSize: 150, lineHeight: 1 }}>
              <span style={{ color: "#14254a", marginRight: 32 }}>THE</span>
              <span style={{ color: "#6b1726" }}>FORGOTTEN</span>
              <span style={{ color: "#c1272d" }}>.</span>
            </div>
            <div style={{ display: "flex", fontFamily: "Mono", fontSize: 28, color: "#34332f", marginTop: 22 }}>
              Honoring the veterans our communities overlook.
            </div>
          </div>
          <div style={{ display: "flex", fontFamily: "Mono", fontSize: 20, letterSpacing: 4, color: "#6e6a62" }}>LISTEN · DOCUMENT · SHARE · THEFORGOTTEN.SITE</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: 140 }}>
          <div style={{ display: "flex", height: 240, background: "#14254a" }} />
          {stripes.map((i) => <div key={i} style={{ display: "flex", flex: 1, background: i % 2 === 0 ? "#c1272d" : "#fffdf9" }} />)}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Anton", data: anton, weight: 400 }, { name: "Mono", data: mono, weight: 500 }] }
  );
}
