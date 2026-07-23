import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/vehicles", "/about", "/contact", "/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  const isPublic = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isClientDashboard = pathname.startsWith("/dashboard/client");
  const isAgencyDashboard = pathname.startsWith("/dashboard/agency");
  const isAdminRoute = pathname.startsWith("/admin");

  if (!token && (isClientDashboard || isAgencyDashboard || isAdminRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (token && pathname === "/dashboard") {
    const role = decodeRoleFromToken(token);
    if (role === "AGENCY") {
      return NextResponse.redirect(new URL("/dashboard/agency", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard/client", request.url));
  }

  if (isClientDashboard && token) {
    const role = decodeRoleFromToken(token);
    if (role !== "CLIENT") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (isAgencyDashboard && token) {
    const role = decodeRoleFromToken(token);
    if (role !== "AGENCY") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

function decodeRoleFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1] as string));
    return payload.role || null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
