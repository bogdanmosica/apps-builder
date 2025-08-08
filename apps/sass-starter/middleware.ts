import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { signToken, verifyToken } from "@/lib/auth/session";

const protectedRoutes = [
  "/dashboard",
  "/analytics",
  "/ai-insights",
  "/integrations",
  "/onboarding",
  "/pricing",
  "/security",
  "/settings",
  "/team",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Check user role for protected routes
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const userRole = parsed.user?.role || "member";
      const isAdminUser = userRole === "owner" || userRole === "admin";

      if (!isAdminUser) {
        // Redirect regular members to marketing page instead of protected routes
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Error verifying token for role check:", error);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  const res = NextResponse.next();

  if (sessionCookie && request.method === "GET") {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: "session",
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: expiresInOneDay,
      });
    } catch (error) {
      console.error("Error updating session:", error);
      res.cookies.delete("session");
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  runtime: "nodejs",
};
