import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mes Favoris",
  description: "Consultez, gérez et révisez vos versets, hadiths et tafsir mis en favori ou marque-page.",
}

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
