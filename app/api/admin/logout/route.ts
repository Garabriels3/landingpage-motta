import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = cookies();

    // Deletar o cookie definindo uma data de expiração no passado
    cookieStore.delete("admin_token");

    return NextResponse.json({ success: true });
}
