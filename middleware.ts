import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Verificação de Segurança
    const sysToken = request.cookies.get("admin_token")?.value;
    const sysSecret = process.env.ADMIN_SECRET_KEY;
    const isAutenticado = sysToken && sysToken === sysSecret;

    // Rota Login: Se tiver logado, chuta pro painel
    if (pathname === "/admin/login") {
        if (isAutenticado) {
            return NextResponse.redirect(new URL("/admin/conteudos", request.url));
        }
        return NextResponse.next();
    }

    // Outras Rotas de Admin
    if (pathname.startsWith("/admin")) {
        // Se NÃO autenticado -> Login ou 401
        if (!isAutenticado) {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
        // Se autenticado -> Passa
        return NextResponse.next();
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
