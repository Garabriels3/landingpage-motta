import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Verificar se é rota protegida (/admin)
    if (pathname.startsWith("/admin")) {
        // Exceção: Login Page
        if (pathname === "/admin/login") {
            return NextResponse.next();
        }

        // Verificar Cookie
        const token = request.cookies.get("admin_token")?.value;
        const secret = process.env.ADMIN_SECRET_KEY;

        // Se o token for válido, permitir
        if (token && token === secret) {
            return NextResponse.next();
        }

        // Se falhar:
        // 1. Para API, retornar 401 (opcional, já tratado nos handlers, mas reforça)
        // No entanto, como já tratei nos handlers, vou focar na proteção de PAGES aqui.
        // Se eu bloquear API aqui, preciso garantir que o formato de erro seja JSON.
        if (pathname.startsWith("/api/")) {
            // Deixa o handler da API tratar (ou retorna 401 aqui se quisesse ser estrito)
            // Vou deixar passar se for API para não duplicar lógica ou causar issues de CORS/Format
            // NA VERDADE: O usuário pediu middleware para "route protection".
            // Proteger APIs aqui economiza recursos do servidor.
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Para Páginas, Redirecionar para Login
        const loginUrl = new URL("/admin/login", request.url);
        // Opcional: Adicionar returnTo
        // loginUrl.searchParams.set("returnTo", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths starting with /admin
         */
        "/admin/:path*",
        /*
         * Match API admin paths too? 
         * "/api/admin/:path*"
         */
        "/api/admin/:path*",
    ],
};
