"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_LINKS = [
  { href: "/corpus",        label: "Corpus" },
  { href: "/apprentissage", label: "Apprentissage" },
  { href: "/favoris",       label: "Favoris" },
  { href: "/a-propos",      label: "À propos" },
]

interface NavBarProps {
  transparentOnTop?: boolean
}

export default function NavBar({ transparentOnTop = false }: NavBarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

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

  useEffect(() => {
    if (!transparentOnTop) return
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [transparentOnTop])

  return (
    <>
      <header
        className={transparentOnTop ? "fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" : "sticky top-0 z-50"}
        style={{
          background: transparentOnTop 
            ? (scrolled ? "rgba(5, 13, 7, 0.88)" : "transparent") 
            : "var(--color-bg)",
          backdropFilter: transparentOnTop && scrolled ? "blur(12px)" : "none",
          borderBottom: transparentOnTop
            ? (scrolled ? "1px solid rgba(200, 157, 58, 0.2)" : "1px solid transparent")
            : "1px solid var(--color-border)"
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Gauche : Logo */}
          <div 
            className="flex-1 flex justify-start items-center transition-opacity duration-500"
            style={{ opacity: transparentOnTop && !scrolled ? 0 : 1 }}
          >
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/symbole_gold.png"
                alt="Bayran Symbole"
                className="h-9.5 md:h-11 w-auto object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <span className="text-[#C89D3A] text-[7px] md:text-[8px] self-center select-none opacity-85 mx-0.5" style={{ transform: "translateY(-0.8px)" }}>◆</span>
              <img
                src="/bayran_text.png"
                alt="Bayran Logo"
                className="h-4.5 md:h-5 w-auto object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                style={{ transform: "translateY(0.8px)" }}
              />
            </Link>
          </div>

          {/* Centre : Menu centré */}
          <nav className="hidden md:flex items-center justify-center gap-8 flex-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[#C89D3A]"
                style={{
                  color: transparentOnTop && !scrolled
                    ? "rgba(250, 247, 239, 0.65)"
                    : (pathname.startsWith(l.href) ? "var(--color-gold)" : "var(--color-text-muted)"),
                  fontWeight: pathname.startsWith(l.href) ? 500 : 400,
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Droite : Bouton CTA */}
          <div className="hidden md:flex flex-1 justify-end items-center">
            <Link
              href="/search"
              className="text-xs font-semibold px-5 py-2.5 rounded-full border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#C89D3A] hover:text-black uppercase tracking-wider hover:scale-105"
              style={{ 
                borderColor: "var(--color-gold)", 
                color: transparentOnTop && !scrolled ? "#B88A44" : "var(--color-gold)", 
                background: transparentOnTop && !scrolled ? "rgba(250, 248, 245, 0.6)" : "rgba(200, 157, 58, 0.1)" 
              }}
            >
              Rechercher →
            </Link>
          </div>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-lg transition-colors"
            style={{ color: transparentOnTop && !scrolled ? "#B88A44" : "var(--color-text)" }}
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
          <img
            src="/symbole_gold.png"
            alt="Bayran Logo"
            className="h-10 w-auto object-contain"
          />
          <button
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
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
