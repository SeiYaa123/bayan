"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_LINKS = [
  { href: "/search",        label: "Recherche" },
  { href: "/corpus",        label: "Corpus" },
  { href: "/apprentissage", label: "Apprendre" },
  { href: "/fiqh/compare",  label: "Fiqh" },
  { href: "/evolution",     label: "Évolution" },
]

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      <header
        className="sticky top-0 z-50"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span
              dir="rtl"
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: "1.65rem",
                fontWeight: 700,
                color: "var(--color-gold)",
                lineHeight: 1,
              }}
            >
              بيان
            </span>
            <span style={{ width: "1px", height: "1.1rem", background: "rgba(200,157,58,0.35)" }} />
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "0.85rem",
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              Bayān
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm transition-colors hover:text-[#C89D3A]"
                style={{
                  color: pathname.startsWith(l.href) ? "var(--color-gold)" : "var(--color-text-muted)",
                  fontWeight: pathname.startsWith(l.href) ? 500 : 400,
                }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/search"
              className="text-sm px-5 py-2 rounded-lg border transition-colors hover:bg-[#C89D3A]/10"
              style={{ borderColor: "var(--color-gold)", color: "var(--color-text)" }}
            >
              Commencer
            </Link>
          </nav>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-lg transition-colors"
            style={{ color: "var(--color-text)" }}
          >
            <span
              className="block w-5 h-px transition-all duration-300 origin-center"
              style={{
                background: "currentColor",
                transform: open ? "translateY(5px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block w-5 h-px transition-all duration-300"
              style={{
                background: "currentColor",
                opacity: open ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-px transition-all duration-300 origin-center"
              style={{
                background: "currentColor",
                transform: open ? "translateY(-5px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(5,13,7,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer panel */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-72 md:hidden flex flex-col transition-transform duration-300 ease-out"
        style={{
          background: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <span
            dir="rtl"
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--color-gold)",
              lineHeight: 1,
            }}
          >
            بيان
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "var(--color-text-muted)" }}
          >
            ✕
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex flex-col px-4 py-6 gap-1 flex-1">
          {NAV_LINKS.map((l) => {
            const isActive = pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors"
                style={{
                  background: isActive ? "rgba(200,157,58,0.1)" : "transparent",
                  color: isActive ? "var(--color-gold)" : "var(--color-text)",
                  border: `1px solid ${isActive ? "rgba(200,157,58,0.25)" : "transparent"}`,
                  fontWeight: isActive ? 500 : 400,
                  fontSize: "0.95rem",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: isActive ? "var(--color-gold)" : "rgba(250,247,239,0.2)" }}
                />
                {l.label}
              </Link>
            )
          })}
        </nav>

        {/* Drawer CTA */}
        <div className="px-4 pb-8">
          <Link
            href="/search"
            className="flex items-center justify-center w-full py-3.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "rgba(200,157,58,0.15)",
              border: "1px solid rgba(200,157,58,0.35)",
              color: "var(--color-gold)",
            }}
          >
            Commencer la recherche →
          </Link>
        </div>
      </div>
    </>
  )
}
