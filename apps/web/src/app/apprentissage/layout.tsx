import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Apprentissage",
  description: "Système d'apprentissage de l'Islam de manière autonome avec des leçons interactives, des quiz et la mémorisation.",
}

export default function ApprentissageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
