import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const AUTH_PAGES = ["/login", "/register"];
const isDev = process.env.NODE_ENV === "development";

/**
 * CSP générée par requête avec un nonce unique plutôt qu'un script-src
 * statique : Next.js injecte ses propres <script> inline (hydratation,
 * données RSC) sur chaque page, qu'un simple `script-src 'self'` bloque
 * entièrement. En posant le nonce à la fois sur les headers de la requête
 * (que Next.js relit pour appliquer automatiquement ce même nonce à ses
 * scripts internes) et sur la réponse (lue par le navigateur), on garde un
 * script-src strict sans lister ces scripts un par un.
 */
function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Framer Motion et React pilotent des styles inline via l'attribut style —
    // 'unsafe-inline' reste nécessaire ici (risque limité : injection CSS, pas
    // d'exécution de code, contrairement à script-src).
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self' data:",
    `connect-src 'self' https://*.supabase.co${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", csp);

  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set("Content-Security-Policy", csp);
    return redirectResponse;
  }

  if (AUTH_PAGES.includes(pathname) && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set("Content-Security-Policy", csp);
    return redirectResponse;
  }

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
