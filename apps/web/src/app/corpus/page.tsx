import Link from "next/link"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { getHadithCollections, getTafsirCollections } from "@/lib/api"

const COLLECTION_ICONS: Record<string, string> = {
  bukhari:   "البخاري",
  muslim:    "مسلم",
  abu_dawud: "أبو داود",
  tirmidhi:  "الترمذي",
  nasai:     "النسائي",
  ibn_majah: "ابن ماجه",
}

export default async function CorpusPage() {
  let collections: Awaited<ReturnType<typeof getHadithCollections>> = []
  let tafsirCollections: Awaited<ReturnType<typeof getTafsirCollections>> = []
  try {
    collections = await getHadithCollections()
  } catch {
    // API indisponible — page dégradée
  }
  try {
    tafsirCollections = await getTafsirCollections()
  } catch {
    // tafsir pas encore ingéré
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <NavBar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <p
          dir="rtl"
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            color: "rgba(200,157,58,0.15)",
            lineHeight: 1,
            letterSpacing: "0.04em",
            userSelect: "none",
            marginBottom: "1.5rem",
          }}
        >
          اقْرَأْ
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 300,
            color: "var(--color-text)",
            lineHeight: 1.15,
            marginBottom: "1rem",
          }}
        >
          Corpus islamique
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)", maxWidth: "520px", lineHeight: 1.7 }}>
          Parcourez les textes sources dans leur langue originale, avec traductions et références complètes.
          Aucune interprétation ajoutée — la source primaire telle qu&apos;elle est.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-8 [&>*:last-child]:lg:col-span-2">
        {/* Coran */}
        <Link
          href="/corpus/quran"
          className="group rounded-2xl border p-8 flex flex-col gap-6 transition-colors hover:border-[rgba(200,157,58,0.4)]"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                dir="rtl"
                style={{
                  fontFamily: "'Amiri', serif",
                  fontSize: "2.6rem",
                  color: "var(--color-gold)",
                  lineHeight: 1,
                  marginBottom: "0.5rem",
                }}
              >
                القرآن الكريم
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.4rem",
                  fontWeight: 400,
                  color: "var(--color-text)",
                }}
              >
                Le Saint Coran
              </h2>
            </div>
            <span
              className="shrink-0 mt-1 text-xs px-2 py-1 rounded-full"
              style={{ background: "rgba(200,157,58,0.1)", color: "var(--color-gold)" }}
            >
              quran
            </span>
          </div>

          <div className="flex gap-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <span><strong style={{ color: "var(--color-text)" }}>114</strong> sourates</span>
            <span><strong style={{ color: "var(--color-text)" }}>6 236</strong> ayats</span>
            <span><strong style={{ color: "var(--color-text)" }}>FR</strong> + EN</span>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.65 }}>
            Texte arabe (Tanzil) · Traduction française (Hamidullah) · Traduction anglaise (Sahih International)
          </p>

          <span
            className="text-sm self-start transition-colors group-hover:text-[#C89D3A]"
            style={{ color: "var(--color-text-muted)" }}
          >
            Parcourir les sourates →
          </span>
        </Link>

        {/* Hadith */}
        <div
          className="rounded-2xl border p-8 flex flex-col gap-5"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div>
            <p
              dir="rtl"
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: "2.6rem",
                color: "var(--color-gold)",
                lineHeight: 1,
                marginBottom: "0.5rem",
              }}
            >
              الحديث النبوي
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.4rem",
                fontWeight: 400,
                color: "var(--color-text)",
              }}
            >
              Hadiths du Prophète
            </h2>
          </div>

          {collections.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Collections indisponibles pour le moment.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {collections.map((c) => (
                <Link
                  key={c.collection}
                  href={`/corpus/hadith/${c.collection}`}
                  className="flex items-center justify-between rounded-lg px-4 py-3 border transition-colors hover:border-[rgba(200,157,58,0.3)]"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2, rgba(255,255,255,0.02))" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      dir="rtl"
                      style={{ fontFamily: "'Amiri', serif", fontSize: "1.15rem", color: "var(--color-gold)", minWidth: "4rem" }}
                    >
                      {COLLECTION_ICONS[c.collection] ?? c.collection}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text)" }}>{c.label}</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {c.total.toLocaleString("fr-FR")} hadiths
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tafsir */}
        <div
          className="rounded-2xl border p-8 flex flex-col gap-5 lg:col-span-2"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                dir="rtl"
                style={{
                  fontFamily: "'Amiri', serif",
                  fontSize: "2.6rem",
                  color: "rgba(167,139,250,0.55)",
                  lineHeight: 1,
                  marginBottom: "0.5rem",
                }}
              >
                التفسير
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.4rem",
                  fontWeight: 400,
                  color: "var(--color-text)",
                }}
              >
                Tafsir — Exégèse coranique
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { collection: "jalalayn",  arabic: "الجلالين", label: "Tafsir al-Jalalayn", desc: "XVe siècle · concis classique · arabe" },
              { collection: "ibn_kathir", arabic: "ابن كثير", label: "Tafsir Ibn Kathir",  desc: "XIVe siècle · référence sunnite · anglais" },
              { collection: "tabari",    arabic: "الطبري",   label: "Tafsir al-Tabari",   desc: "IXe siècle · encyclopédique" },
            ].map((t) => {
              const live = tafsirCollections.find((c) => c.collection === t.collection)
              return live ? (
                <Link
                  key={t.collection}
                  href={`/corpus/tafsir/${t.collection}`}
                  className="flex items-center justify-between rounded-lg px-4 py-3 border transition-colors hover:border-[rgba(167,139,250,0.35)]"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2, rgba(255,255,255,0.02))" }}
                >
                  <div className="flex items-center gap-3">
                    <span dir="rtl" style={{ fontFamily: "'Amiri', serif", fontSize: "1.15rem", color: "rgba(167,139,250,0.8)", minWidth: "4rem" }}>
                      {t.arabic}
                    </span>
                    <div>
                      <p style={{ fontSize: "0.85rem", color: "var(--color-text)" }}>{t.label}</p>
                      <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{t.desc}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {live.total.toLocaleString("fr-FR")} versets
                  </span>
                </Link>
              ) : (
                <div
                  key={t.collection}
                  className="flex items-center justify-between rounded-lg px-4 py-3 border"
                  style={{ borderColor: "var(--color-border)", opacity: 0.4 }}
                >
                  <div className="flex items-center gap-3">
                    <span dir="rtl" style={{ fontFamily: "'Amiri', serif", fontSize: "1.15rem", color: "rgba(167,139,250,0.7)", minWidth: "4rem" }}>{t.arabic}</span>
                    <div>
                      <p style={{ fontSize: "0.85rem", color: "var(--color-text)" }}>{t.label}</p>
                      <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{t.desc}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>à venir</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
