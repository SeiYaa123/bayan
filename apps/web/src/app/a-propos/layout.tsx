import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "À propos",
  description: "Découvrez la note d'intention, les limites et le formulaire de suggestion pour le projet Bayān.",
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
