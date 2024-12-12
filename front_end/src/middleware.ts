import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("jwt")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  try {
    const response = await fetch(new URL("/api/verify-jwt", request.url), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

export const config = {
  matcher: ["/tasks/:path*"],
};
