import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminRequest } from "./app/admin-auth";

export async function proxy(request: NextRequest) {
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
  matcher: ["/admin/:path*"],
};
