"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"

export type CardFormat = "square" | "story"
export type CardTheme = "dark_gold" | "ivory_parchment" | "emerald_night"

export interface ShareCardData {
  reference: string
  collection?: string
  source_type: "quran" | "hadith" | "tafsir"
  arabic: string
  translation?: string
}

export interface ShareCardModalProps {
  data: ShareCardData | null
  isOpen: boolean
  onClose: () => void
}

interface ThemeConfig {
  name: string
  bgGradStart: string
  bgGradEnd: string
  border: string
  accent: string
  arabicText: string
  translationText: string
  brandText: string
  badgeBg: string
  badgeText: string
}

const THEMES: Record<CardTheme, ThemeConfig> = {
  dark_gold: {
    name: "Dark Gold",
    bgGradStart: "#0E1C12",
    bgGradEnd: "#040905",
    border: "#C89D3A",
    accent: "#D4AF37",
    arabicText: "#F3E5AB",
    translationText: "#E2E8F0",
    brandText: "#C89D3A",
    badgeBg: "rgba(200, 157, 58, 0.18)",
    badgeText: "#E2C374",
  },
  ivory_parchment: {
    name: "Ivory Parchment",
    bgGradStart: "#FFFDF7",
    bgGradEnd: "#F2ECE0",
    border: "#9A7B2C",
    accent: "#9A7B2C",
    arabicText: "#1A261C",
    translationText: "#334155",
    brandText: "#85651F",
    badgeBg: "rgba(154, 123, 44, 0.12)",
    badgeText: "#85651F",
  },
  emerald_night: {
    name: "Emerald Night",
    bgGradStart: "#0A3324",
    bgGradEnd: "#02140D",
    border: "#34D399",
    accent: "#FBBF24",
    arabicText: "#FCD34D",
    translationText: "#ECFDF5",
    brandText: "#34D399",
    badgeBg: "rgba(52, 211, 153, 0.18)",
    badgeText: "#6EE7B7",
  },
}

const SOURCE_LABELS: Record<string, string> = {
  quran: "CORAN",
  hadith: "HADITH",
  tafsir: "TAFSIR",
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let currentLine = ""

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    if (!word) continue
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) {
    lines.push(currentLine)
  }
  return lines
}

export default function ShareCardModal({ data, isOpen, onClose }: ShareCardModalProps) {
  const [format, setFormat] = useState<CardFormat>("square")
  const [themeKey, setThemeKey] = useState<CardTheme>("dark_gold")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const theme = THEMES[themeKey]

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !data) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = 1080
    const height = format === "square" ? 1080 : 1920

    canvas.width = width
    canvas.height = height

    // 1. Background Gradient
    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, theme.bgGradStart)
    grad.addColorStop(1, theme.bgGradEnd)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // 2. Outer & Inner Frame
    const outerMargin = 40
    const innerMargin = 52

    ctx.strokeStyle = theme.border
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.5
    ctx.strokeRect(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2)

    ctx.lineWidth = 1
    ctx.globalAlpha = 0.3
    ctx.strokeRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2)
    ctx.globalAlpha = 1.0

    // Ornate Corners
    const cornerSize = 24
    const drawCorner = (x: number, y: number, dx: number, dy: number) => {
      ctx.beginPath()
      ctx.moveTo(x, y + dy * cornerSize)
      ctx.lineTo(x, y)
      ctx.lineTo(x + dx * cornerSize, y)
      ctx.strokeStyle = theme.accent
      ctx.lineWidth = 3
      ctx.stroke()
    }
    drawCorner(outerMargin, outerMargin, 1, 1)
    drawCorner(width - outerMargin, outerMargin, -1, 1)
    drawCorner(outerMargin, height - outerMargin, 1, -1)
    drawCorner(width - outerMargin, height - outerMargin, -1, -1)

    // 3. Brand Header
    let currentY = format === "square" ? 120 : 180

    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    ctx.font = "700 24px Inter, sans-serif"
    ctx.fillStyle = theme.brandText
    ctx.letterSpacing = "6px"
    ctx.fillText("BAYĀN · بيان", width / 2, currentY)

    currentY += 60

    // 4. Source Badge
    const sourceLabel = SOURCE_LABELS[data.source_type] ?? data.source_type.toUpperCase()
    const badgeText = `${sourceLabel} · ${data.reference}`
    ctx.font = "600 22px Inter, sans-serif"
    const badgeWidth = ctx.measureText(badgeText).width + 48
    const badgeHeight = 44

    ctx.fillStyle = theme.badgeBg
    ctx.beginPath()
    ctx.roundRect(width / 2 - badgeWidth / 2, currentY - badgeHeight / 2, badgeWidth, badgeHeight, 22)
    ctx.fill()

    ctx.strokeStyle = theme.border
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.4
    ctx.stroke()
    ctx.globalAlpha = 1.0

    ctx.fillStyle = theme.badgeText
    ctx.fillText(badgeText, width / 2, currentY + 1)

    // Calculate vertical content area
    const contentStartY = currentY + 70
    const contentEndY = height - (format === "square" ? 120 : 180)
    const availableHeight = contentEndY - contentStartY

    // 5. Arabic Text
    const maxTextWidth = width - 180
    let arabicFontSize = data.arabic.length > 250 ? 38 : data.arabic.length > 120 ? 46 : 56
    if (format === "story" && data.arabic.length < 150) arabicFontSize = 60

    ctx.font = `400 ${arabicFontSize}px 'Amiri', 'Tajawal', serif`
    ctx.fillStyle = theme.arabicText
    ctx.direction = "rtl"

    let arabicLines = wrapText(ctx, data.arabic, maxTextWidth)
    let arabicLineHeight = arabicFontSize * 1.85

    // Scale down if lines take too much space
    while (arabicLines.length * arabicLineHeight > availableHeight * 0.55 && arabicFontSize > 28) {
      arabicFontSize -= 4
      ctx.font = `400 ${arabicFontSize}px 'Amiri', 'Tajawal', serif`
      arabicLineHeight = arabicFontSize * 1.85
      arabicLines = wrapText(ctx, data.arabic, maxTextWidth)
    }

    // Render Arabic lines
    let arabicStartY = contentStartY + (format === "square" ? 60 : 100)
    for (let i = 0; i < arabicLines.length; i++) {
      ctx.fillText(arabicLines[i], width / 2, arabicStartY + i * arabicLineHeight)
    }

    let cursorY = arabicStartY + arabicLines.length * arabicLineHeight

    // 6. Separator Diamond
    ctx.direction = "ltr"
    cursorY += 20
    ctx.font = "20px serif"
    ctx.fillStyle = theme.border
    ctx.globalAlpha = 0.6
    ctx.fillText("❖", width / 2, cursorY)
    ctx.globalAlpha = 1.0
    cursorY += 40

    // 7. Translation Text
    if (data.translation) {
      let transFontSize = data.translation.length > 250 ? 24 : 30
      ctx.font = `300 ${transFontSize}px 'Cormorant Garamond', 'Inter', serif`
      ctx.fillStyle = theme.translationText

      let transLines = wrapText(ctx, data.translation, maxTextWidth)
      let transLineHeight = transFontSize * 1.55

      while (transLines.length * transLineHeight > (contentEndY - cursorY - 60) && transFontSize > 18) {
        transFontSize -= 2
        ctx.font = `300 ${transFontSize}px 'Cormorant Garamond', 'Inter', serif`
        transLineHeight = transFontSize * 1.55
        transLines = wrapText(ctx, data.translation, maxTextWidth)
      }

      for (let i = 0; i < transLines.length; i++) {
        ctx.fillText(transLines[i], width / 2, cursorY + i * transLineHeight)
      }
    }

    // 8. Footer Watermark
    ctx.font = "500 20px Inter, sans-serif"
    ctx.fillStyle = theme.brandText
    ctx.globalAlpha = 0.6
    ctx.fillText("bayran.fr", width / 2, height - (format === "square" ? 65 : 100))
    ctx.globalAlpha = 1.0

  }, [data, format, themeKey, theme])

  useEffect(() => {
    if (isOpen) {
      // Ensure fonts are loaded before drawing canvas
      if (typeof document !== "undefined" && document.fonts) {
        document.fonts.ready.then(() => {
          drawCanvas()
        })
      } else {
        drawCanvas()
      }
    }
  }, [isOpen, drawCanvas])

  if (!isOpen || !data) return null

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    const safeRef = data.reference.replace(/[^a-zA-Z0-9_-]/g, "_")
    link.download = `bayan-carte-${safeRef}-${format}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/65 transition-opacity"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative z-10 w-full max-w-4xl rounded-2xl border shadow-2xl flex flex-col lg:flex-row overflow-hidden my-auto max-h-[90vh]"
        style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}
      >
        {/* Left: Live Preview */}
        <div
          className="flex-1 p-6 flex flex-col items-center justify-center bg-black/40 border-b lg:border-b-0 lg:border-r overflow-hidden min-h-[320px]"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="relative max-w-full max-h-[55vh] flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-lg shadow-2xl max-w-full max-h-[55vh] w-auto h-auto object-contain border border-white/10"
              style={{
                aspectRatio: format === "square" ? "1 / 1" : "9 / 16",
              }}
            />
          </div>
          <span className="text-xs mt-3 font-mono text-white/40">
            Aperçu en direct ({format === "square" ? "1:1 Carré" : "9:16 Story"})
          </span>
        </div>

        {/* Right: Customization Controls */}
        <div className="w-full lg:w-96 p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: "var(--color-text)",
                }}
              >
                Générateur de Carte
              </h2>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Personnalisez et téléchargez la citation
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
          </div>

          {/* Format Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Format d&apos;image
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat("square")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  format === "square"
                    ? "border-[#C89D3A] bg-[#C89D3A]/15 text-[#C89D3A]"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                }`}
              >
                <span className="w-3.5 h-3.5 border border-current rounded-sm inline-block" />
                Carré (1:1)
              </button>
              <button
                onClick={() => setFormat("story")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  format === "story"
                    ? "border-[#C89D3A] bg-[#C89D3A]/15 text-[#C89D3A]"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                }`}
              >
                <span className="w-2.5 h-4 border border-current rounded-sm inline-block" />
                Story (9:16)
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Thème Visuel
            </label>
            <div className="flex flex-col gap-2">
              {(Object.keys(THEMES) as CardTheme[]).map((tKey) => {
                const t = THEMES[tKey]
                const isActive = themeKey === tKey
                return (
                  <button
                    key={tKey}
                    onClick={() => setThemeKey(tKey)}
                    className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                      isActive
                        ? "border-[#C89D3A] bg-[#C89D3A]/10 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                        style={{
                          background: `linear-gradient(135deg, ${t.bgGradStart}, ${t.bgGradEnd})`,
                          borderColor: t.border,
                        }}
                      />
                      <span>{t.name}</span>
                    </div>
                    {isActive && (
                      <svg className="w-4 h-4 text-[#C89D3A] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Download CTA */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <button
              onClick={handleDownload}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #C89D3A, #E2C374)",
                color: "#050D07",
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Télécharger l&apos;image (PNG)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
