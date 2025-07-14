import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isAuthed = Boolean(req.cookies.get("auth-demo")?.value);

  if (!isAuthed && !req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}


export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };
