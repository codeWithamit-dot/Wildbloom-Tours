import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const adminRoute = "/dashboard/admin";
const userRoute = "/dashboard/user";
const loginRoute = "/auth/login";

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/api")) {
      console.log("Skipping middleware for API path:", pathname);
      return NextResponse.next();
    }

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    console.log("Middleware triggered for path:", pathname);
    console.log("Token:", token ? "Exists" : "Null");

    const url = req.nextUrl.clone();

    if (pathname.startsWith("/auth") || pathname === "/") {
      return NextResponse.next();
    }

    if (!token) {
      console.log("No token found - redirecting to login");
      url.pathname = loginRoute;
      return NextResponse.redirect(url);
    }

    const role = token.role || "user";

    if (pathname.startsWith(adminRoute) && role !== "admin") {
      console.log(`User with role ${role} tried to access admin route`);
      url.pathname = userRoute;
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith(userRoute) && role !== "user") {
      console.log(`Admin tried to access user route`);
      url.pathname = adminRoute;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    const url = req.nextUrl.clone();
    url.pathname = loginRoute;
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/login",
  ],
};