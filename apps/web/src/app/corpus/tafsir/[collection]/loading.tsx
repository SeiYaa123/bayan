import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"

export default function TafsirCollectionLoading() {
  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ background: "var(--color-bg)" }}>
      <NavBar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center gap-6">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div 
            className="absolute inset-0 rounded-full border-2 border-dashed animate-spin"
            style={{ 
              borderColor: "var(--color-gold) transparent var(--color-gold) transparent",
              animationDuration: "2s"
            }}
          />
          <div 
            className="w-8 h-8 rounded-full border border-double animate-pulse"
            style={{ borderColor: "var(--color-border-soft)" }}
          />
        </div>

        <div className="flex flex-col gap-2 max-w-md">
          <h2 
            className="text-lg font-medium tracking-wide shimmer-text"
            style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--color-text)" 
            }}
          >
            Chargement de la collection de Tafsir...
          </h2>
          <p 
            className="text-xs leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            Récupération des métadonnées de la sourate et des versets commentés en cours.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
