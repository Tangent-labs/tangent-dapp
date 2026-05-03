import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true"
const MAINTENANCE_PATH = "/maintenance"

const PREDEPOSIT_MODE = process.env.NEXT_PUBLIC_IS_PREDEPOSIT_PHASE === "true"
const ALLOWED_PATH = "/predeposit"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (MAINTENANCE_MODE) {
    if (pathname === MAINTENANCE_PATH) return NextResponse.next()
    return NextResponse.rewrite(new URL(MAINTENANCE_PATH, request.url))
  }

  if (pathname === MAINTENANCE_PATH) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (PREDEPOSIT_MODE && pathname !== ALLOWED_PATH) {
    return NextResponse.redirect(new URL(ALLOWED_PATH, request.url))
  }

  return NextResponse.next()
}

// Avoid the middleware to block any logos, images, fonts, etc...
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)"],
}
