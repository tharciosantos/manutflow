import { updateSession } from "@/lib/supabase/middleware";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16+ usa a convenção "proxy" em vez de "middleware"
export async function proxy(request: NextRequest) {
    let supabaseResponse: NextResponse;
    let user: Awaited<ReturnType<typeof updateSession>>["user"];

    try {
        ({ supabaseResponse, user } = await updateSession(request));
    } catch (error) {
        // AUD-31: sem env o proxy roda em toda request; sem este tratamento um
        // .env incompleto virava erro genérico em cada navegação.
        logger('error', 'proxy.supabase_unavailable', {
            error: error instanceof Error ? error.message : 'erro desconhecido',
        });
        return NextResponse.json(
            { error: "Serviço de autenticação indisponível." },
            { status: 503 },
        );
    }

    const { pathname } = request.nextUrl;

    // ==========================================
    // ROTAS PÚBLICAS (não precisam de autenticação)
    // ==========================================
    // /api/demo-login é pública de propósito: é ela que cria a sessão da demo,
    // antes de existir qualquer usuário autenticado. Sem isso o proxy
    // redirecionaria o POST para /login e o botão da landing nunca funcionaria.
    // /robots.txt, /sitemap.xml e /opengraph-image são públicos pela natureza do
    // arquivo (AUD-13): crawlers e scrapers de link não têm sessão.
    const publicRoutes = [
        "/login",
        "/register",
        "/auth/callback",
        "/api/demo-login",
        "/robots.txt",
        "/sitemap.xml",
        "/opengraph-image",
    ];
    const isPublicRoute = pathname === "/" || publicRoutes.some((route) => pathname.startsWith(route));

    // ==========================================
    // NÃO AUTENTICADO + ROTA PROTEGIDA → REDIRECIONAR
    // ==========================================
    if (!user && !isPublicRoute) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("redirect", pathname);

        return NextResponse.redirect(loginUrl);
    }

    // ==========================================
    // AUTENTICADO + TELA DE LOGIN/CADASTRO → HOME
    // ==========================================
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
    if (user && isAuthRoute) {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = "/";
        return NextResponse.redirect(homeUrl);
    }

    // ==========================================
    // PERMITIR ACESSO
    // ==========================================
    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/health|api/cron(?:/|$)|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
