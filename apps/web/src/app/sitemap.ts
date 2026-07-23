import { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.bayran.fr"

export default function sitemap(): MetadataRoute.Sitemap {
  // 114 Quran chapters
  const quranRoutes = Array.from({ length: 114 }, (_, i) => ({
    url: `${BASE_URL}/corpus/quran/${i + 1}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // Only bukhari and muslim collections are active and indexed
  const collections = ["bukhari", "muslim"]
  const hadithRoutes = collections.map((col) => ({
    url: `${BASE_URL}/corpus/hadith/${col}`,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }))

  // 114 Tafsir Ibn Kathir chapters
  const tafsirRoutes = Array.from({ length: 114 }, (_, i) => ({
    url: `${BASE_URL}/corpus/tafsir/ibn_kathir/${i + 1}`,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }))

  return [
    {
      url: BASE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/corpus`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/corpus/quran`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/corpus/tafsir/ibn_kathir`,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/apprentissage`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/a-propos`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...quranRoutes,
    ...hadithRoutes,
    ...tafsirRoutes,
  ]
}
