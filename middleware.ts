import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup")
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/guests") ||
    request.nextUrl.pathname.startsWith("/beds") ||
    request.nextUrl.pathname.startsWith("/dormitories") ||
    request.nextUrl.pathname.startsWith("/assignments") ||
    request.nextUrl.pathname.startsWith("/transactions") ||
    request.nextUrl.pathname.startsWith("/bar") ||
    request.nextUrl.pathname.startsWith("/extras") ||
    request.nextUrl.pathname.startsWith("/expenses") ||
    request.nextUrl.pathname.startsWith("/calendar") ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/profile")

  // If trying to access a protected route without being logged in
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If trying to access auth routes while logged in
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/guests/:path*",
    "/beds/:path*",
    "/dormitories/:path*",
    "/assignments/:path*",
    "/transactions/:path*",
    "/bar/:path*",
    "/extras/:path*",
    "/expenses/:path*",
    "/calendar/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
  ],
}
