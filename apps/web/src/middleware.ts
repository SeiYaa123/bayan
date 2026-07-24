import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Hadith collections check
  if (pathname.startsWith("/corpus/hadith/")) {
    const segments = pathname.split("/")
    const collection = segments[3] // /corpus/hadith/[collection]
    if (collection && collection !== "bukhari" && collection !== "muslim") {
      const url = req.nextUrl.clone()
      url.pathname = "/404"
      return NextResponse.rewrite(url, { status: 404 })
    }
  }

  // 2. Tafsir collections check
  if (pathname.startsWith("/corpus/tafsir/")) {
    const segments = pathname.split("/")
    const collection = segments[3] // /corpus/tafsir/[collection]
    if (collection && collection !== "ibn_kathir") {
      const url = req.nextUrl.clone()
      url.pathname = "/404"
      return NextResponse.rewrite(url, { status: 404 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/corpus/hadith/:path*", "/corpus/tafsir/:path*"],
}
