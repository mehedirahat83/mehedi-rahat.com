import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminRequest } from "./app/admin-auth";

const legacyProductSlugs: Record<string, string> = {
  "elementor-pro": "elementor-pro-license-key",
};

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/product") {
    const legacySlug = request.nextUrl.searchParams.get("id")?.trim();
    if (legacySlug) {
      const destination = request.nextUrl.clone();
      destination.pathname = `/product/${encodeURIComponent(legacyProductSlugs[legacySlug] || legacySlug)}`;
      destination.search = "";
      return NextResponse.redirect(destination, 308);
    }
  }

  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  const authenticated = await isAdminRequest(request);

  if (!authenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (authenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/product"],
};
