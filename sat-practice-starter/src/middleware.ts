import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const url = new URL(req.url);
  if (url.pathname.startsWith("/admin")) {
    const token = (req as any).cookies?.get?.("token")?.value || "";
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
