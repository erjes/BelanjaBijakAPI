import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getJwtSecret, verifyJwt } from "@/lib/jwt";

const publicApiPaths = ["/api/health", "/api/auth/token"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicApiPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    return unauthorized("Token JWT wajib dikirim lewat header Authorization Bearer");
  }

  try {
    const payload = await verifyJwt(token, getJwtSecret());

    if (!payload) {
      return unauthorized("Token JWT tidak valid atau sudah kedaluwarsa");
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-auth-sub", payload.sub);
    requestHeaders.set("x-auth-role", payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "JWT_SECRET belum diatur di environment server" },
      { status: 500 },
    );
  }
}

function unauthorized(error: string) {
  return NextResponse.json({ error }, { status: 401 });
}

export const config = {
  matcher: ["/api/:path*"],
};
