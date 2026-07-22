import Link from "next/link"

export default function Footer() {
  return (
    <footer style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)" }}>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-16">

          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-2">
              <img
                src="/symbole_gold.png"
                alt="Bayran Symbole"
                className="h-12 w-auto object-contain"
              />
              <span className="text-[#C89D3A] text-[9px] select-none opacity-80 mx-0.5">◆</span>
              <img
                src="/bayran_text.png"
                alt="Bayran Logo"
                className="h-6 w-auto object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(250,247,239,0.38)" }}>
              Moteur de recherche sémantique sur le corpus islamique.
              Outil d&apos;étude uniquement. Accès libre et gratuit.
            </p>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div className="space-y-5">
              <h4 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#C89D3A" }}>
                Produit
              </h4>
              <nav className="flex flex-col gap-3">
                {[
                  { href: "/search",        label: "Recherche" },
                  { href: "/corpus",        label: "Corpus" },
                  { href: "/apprentissage", label: "Apprendre" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm transition-colors hover:text-[#C89D3A]"
                    style={{ color: "rgba(250,247,239,0.45)" }}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="space-y-5">
              <h4 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#C89D3A" }}>
                Corpus
              </h4>
              <nav className="flex flex-col gap-3">
                {[
                  { href: "/corpus/quran",              label: "Coran (6 236 ayats)" },
                  { href: "/corpus/hadith/bukhari",     label: "Hadith Bukhari" },
                  { href: "/corpus/hadith/muslim",      label: "Hadith Muslim" },
                  { href: "/corpus/tafsir/jalalayn",    label: "Tafsir al-Jalalayn" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm transition-colors hover:text-[#C89D3A]"
                    style={{ color: "rgba(250,247,239,0.45)" }}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-4 text-right space-y-4">
            <p
              className="text-2xl leading-relaxed"
              dir="rtl"
              style={{ fontFamily: "'Amiri', serif", color: "rgba(250,247,239,0.72)", fontStyle: "italic" }}
            >
              وَنَزَّلْنَا عَلَيْكَ ٱلْكِتَٰبَ تِبْيَٰنًا لِّكُلِّ شَيْءٍ
            </p>
            <p
              className="text-xs leading-relaxed"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(250,247,239,0.38)", fontStyle: "italic" }}
            >
              « Et Nous avons fait descendre sur toi le Livre comme explication de toute chose. »
            </p>
            <p className="text-[10px] font-bold tracking-widest" style={{ color: "#C89D3A" }}>16:89</p>
          </div>
        </div>

        <div
          className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em]"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(250,247,239,0.18)" }}
        >
          <p>© 2025 Bayān — Outil d&apos;étude uniquement. Pas de fatwa.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:opacity-60 transition-opacity">Confidentialité</Link>
            <Link href="/terms"   className="hover:opacity-60 transition-opacity">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
