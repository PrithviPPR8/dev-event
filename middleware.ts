import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("admin-token")?.value;

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  if (!isAdminRoute) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const payload = verifyAdminToken(token);

  if (!payload || payload.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
