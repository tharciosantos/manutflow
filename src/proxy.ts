import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16+ usa a convenção "proxy" em vez de "middleware"
export async function proxy(request: NextRequest) {
    const { supabaseResponse, user } = await updateSession(request);

    const { pathname } = request.nextUrl;

    // ==========================================
    // ROTAS PÚBLICAS (não precisam de autenticação)
    // ==========================================
    // /api/demo-login é pública de propósito: é ela que cria a sessão da demo,
    // antes de existir qualquer usuário autenticado. Sem isso o proxy
    // redirecionaria o POST para /login e o botão da landing nunca funcionaria.
    const publicRoutes = ["/login", "/register", "/auth/callback", "/api/demo-login"];
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
        "/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
