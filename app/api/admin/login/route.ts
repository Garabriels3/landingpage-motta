
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;

        const adminSecret = process.env.ADMIN_SECRET_KEY;

        if (!adminSecret) {
            return NextResponse.json({ error: "Erro de configuração no servidor." }, { status: 500 });
        }

        if (password === adminSecret) {
            // Login bem sucedido
            const oneDay = 24 * 60 * 60 * 1000;

            cookies().set('admin_token', password, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: oneDay,
                path: '/',
            });

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
        }

    } catch (error) {
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}
