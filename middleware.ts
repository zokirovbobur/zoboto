import { NextRequest, NextResponse } from 'next/server'

// Static prototype directories — served from public/prototypes/
const STATIC_PROTOTYPES = [
  'banking-infra',
  'eventador',
  'finport-blog',
  'halal-freight',
  'mediapark-bnpl',
  'safa',
  'smart-bi',
  'trastbank-pmo',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Serve main portfolio at /
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/index.html'
    return NextResponse.rewrite(url)
  }

  // Clean URLs for static prototypes (e.g. /prototypes/trastbank-pmo → /prototypes/trastbank-pmo/index.html)
  for (const name of STATIC_PROTOTYPES) {
    if (pathname === `/prototypes/${name}` || pathname === `/prototypes/${name}/`) {
      const url = request.nextUrl.clone()
      url.pathname = `/prototypes/${name}/index.html`
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/prototypes/:path*'],
}
