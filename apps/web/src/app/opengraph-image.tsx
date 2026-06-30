import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Bayān — Moteur de recherche sur le corpus islamique"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #050d07 0%, #0b1a0d 55%, #050d07 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(180,130,60,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Arabic calligraphy */}
        <div
          style={{
            fontSize: 96,
            lineHeight: 1.1,
            color: "#C89D3A",
            marginBottom: 24,
            letterSpacing: "0.04em",
            textShadow: "0 0 40px rgba(200,160,74,0.4)",
          }}
        >
          ٱقْرَأْ
        </div>

        {/* Product name */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#FAF7EF",
            letterSpacing: "-0.02em",
            marginBottom: 12,
          }}
        >
          Bayān — بيان
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(250,247,239,0.55)",
            marginBottom: 48,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Recherche sémantique sur le corpus islamique classique
        </div>

        {/* Corpus stats */}
        <div
          style={{
            display: "flex",
            gap: 48,
            alignItems: "center",
          }}
        >
          {[
            { n: "6 236", label: "Ayats" },
            { n: "60 000+", label: "Hadiths" },
            { n: "4", label: "Madhhabs" },
          ].map(({ n, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 32, fontWeight: 700, color: "#C89D3A" }}>{n}</span>
              <span style={{ fontSize: 14, color: "rgba(250,247,239,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom border accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, transparent, #C89D3A 30%, #C89D3A 70%, transparent)",
          }}
        />
      </div>
    ),
    size,
  )
}
