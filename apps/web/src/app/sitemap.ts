import { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://bayran.fr"

export default function sitemap(): MetadataRoute.Sitemap {
  const quranRoutes = Array.from({ length: 114 }, (_, i) => ({
    url: `${BASE_URL}/corpus/quran/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const collections = ["bukhari", "muslim", "abu_dawud", "tirmidhi", "nasai", "ibn_majah"]
  const hadithRoutes = collections.map((col) => ({
    url: `${BASE_URL}/corpus/hadith/${col}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/corpus`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/apprentissage`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/a-propos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...quranRoutes,
    ...hadithRoutes,
  ]
}
