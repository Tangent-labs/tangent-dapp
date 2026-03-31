import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PREDEPOSIT_MODE = process.env.NEXT_PUBLIC_IS_PREDEPOSIT_PHASE === "true"

// single allowed route
const ALLOWED_PATH = "/predeposit"

export function middleware(request: NextRequest) {
  if (!PREDEPOSIT_MODE) return NextResponse.next()

  const { pathname } = request.nextUrl

  if (ALLOWED_PATH !== pathname) {
    return NextResponse.redirect(new URL("/predeposit", request.url))
  }

  return NextResponse.next()
}

// Avoid the middleware to block any logos, images, fonts, etc...
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)"],
}
