import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { AudioProvider } from "@/context/AudioContext"
import { BookmarkProvider } from "@/context/BookmarkContext"
import AudioPlayer from "@/components/AudioPlayer"
import PwaRegister from "@/components/PwaRegister"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.bayran.fr"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050d07",
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Bayān — Recherche Sémantique Islamique",
    template: "%s | Bayān",
  },
  description:
    "Explorez le Coran, 60 000+ hadiths et le tafsir Ibn Kathir grâce à la recherche sémantique en arabe, français et anglais.",
  keywords: [
    "recherche islamique",
    "coran",
    "hadith",
    "tafsir",
    "NLP arabe",
    "moteur de recherche sémantique",
    "Bayān",
  ],
  authors: [{ name: "Bayān" }],
  creator: "Bayān",
  publisher: "Bayān",
  openGraph: {
    title: "Bayān — Recherche Sémantique Islamique",
    description:
      "Explorez le Coran, 60 000+ hadiths et le tafsir Ibn Kathir grâce à la recherche sémantique en arabe, français et anglais.",
    url: BASE_URL,
    siteName: "Bayān",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Bayān — Recherche Sémantique Islamique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bayān — Recherche Sémantique Islamique",
    description: "Explorez le Coran, 60 000+ hadiths et le tafsir Ibn Kathir.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/symbole_gold.png",
    apple: "/symbole_gold.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Bayān",
    "theme-color": "#050d07",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <BookmarkProvider>
          <AudioProvider>
            {children}
            <AudioPlayer />
            <PwaRegister />
          </AudioProvider>
        </BookmarkProvider>
      </body>
    </html>
  )
}
