"use client"

import { useState } from "react"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"

export default function AboutPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [feedbackType, setFeedbackType] = useState("correction")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatusMessage(null)

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, type: feedbackType, message })
      })
      const data = await res.json()
      if (data.success) {
        setStatusType("success")
        setStatusMessage(data.message)
        setName("")
        setEmail("")
        setMessage("")
      } else {
        setStatusType("error")
        setStatusMessage(data.message)
      }
    } catch {
      setStatusType("error")
      setStatusMessage("Une erreur réseau est survenue. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ background: "var(--color-bg)" }}>
      <NavBar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-12 space-y-12">
        {/* Intro Section */}
        <section className="space-y-6 text-center max-w-2xl mx-auto">
          <h1 
            className="text-4xl font-light tracking-wide text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            À propos de Bayān
          </h1>
          <div className="w-12 h-px bg-amber-500/40 mx-auto" />
          <p className="text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Bayān est un moteur de recherche et outil d&apos;étude développé à titre individuel dans le but de faciliter l&apos;accès et la mise en relation des textes sacrés de l&apos;Islam.
          </p>
        </section>

        {/* Disclaimer Card */}
        <section 
          className="p-8 rounded-2xl border text-center relative overflow-hidden max-w-3xl mx-auto"
          style={{ 
            background: "linear-gradient(135deg, rgba(200, 157, 58, 0.05) 0%, rgba(10, 10, 10, 0.4) 100%)",
            borderColor: "rgba(200, 157, 58, 0.25)" 
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-5 blur-2xl bg-amber-500" />
          
          <h2 
            className="text-xl font-medium text-amber-300 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Note d&apos;Intention & Limites
          </h2>
          <p className="text-sm leading-relaxed max-w-2xl mx-auto mb-4" style={{ color: "var(--color-text)" }}>
            <strong>Je ne suis pas un savant, théologien ou juriste musulman.</strong> Ce projet a été initié avant tout pour mon propre usage personnel afin de structurer mes études, faciliter mes recherches de versets et de hadiths, et explorer les réseaux de transmissions historiques.
          </p>
          <p className="text-xs leading-relaxed max-w-xl mx-auto" style={{ color: "var(--color-text-muted)" }}>
            L&apos;interprétation des textes religieux requiert des compétences pointues en linguistique arabe, histoire et jurisprudence. Bayān est un outil technique de mise en relation de données textuelles et ne saurait en aucun cas se substituer à l&apos;avis de savants reconnus.
          </p>
        </section>

        {/* Feedback/Correction Form */}
        <section className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 
              className="text-2xl font-light text-white"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Signaler une correction ou suggestion
            </h3>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Une faute de frappe, une erreur de traduction, une incohérence ou une suggestion d&apos;amélioration ? Votre contribution est la bienvenue.
            </p>
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="p-6 sm:p-8 rounded-xl border space-y-5"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="form-name" className="text-xs font-semibold text-white/70">Nom / Pseudo</label>
                <input
                  id="form-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none transition-all"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)"
                  }}
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="form-email" className="text-xs font-semibold text-white/70">Adresse Email</label>
                <input
                  id="form-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none transition-all"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)"
                  }}
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form-type" className="text-xs font-semibold text-white/70">Type de signalement</label>
              <select
                id="form-type"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none transition-all"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)"
                }}
              >
                <option value="correction">Correction de texte / Traduction</option>
                <option value="bug">Problème technique / Incohérence</option>
                <option value="suggestion">Suggestion d&apos;amélioration</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form-message" className="text-xs font-semibold text-white/70">Votre message</label>
              <textarea
                id="form-message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none transition-all resize-none"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)"
                }}
                placeholder="Décrivez précisément l'erreur constatée (ex: Sourate 2, Verset 255) ou vos suggestions..."
              />
            </div>

            {statusMessage && (
              <div 
                className={`p-4 rounded-lg text-xs font-medium border ${
                  statusType === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {statusMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all duration-300 disabled:opacity-50"
              style={{
                background: "var(--color-gold)",
                color: "#050d07"
              }}
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  )
}
