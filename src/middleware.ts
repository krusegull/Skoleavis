import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const active = req.nextauth.token?.active;

    if (!active || !role) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const path = req.nextUrl.pathname;
    const adminOnly = path.startsWith("/dashboard/brukere") || path.startsWith("/dashboard/skolear");
    const editorOnly = path.startsWith("/dashboard/godkjenning") || path.startsWith("/dashboard/om-oss");

    if (adminOnly && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (editorOnly && role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Vi gjør selve sjekken over - her slipper vi alle forespørsler gjennom
      // til middleware-funksjonen, som håndterer omdirigering til /login.
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
