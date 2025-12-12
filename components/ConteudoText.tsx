"use client";

import { useEffect, useState } from "react";

interface ConteudoTextProps {
    chave: string;
    fallback: string;
    className?: string;
    as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
}

/**
 * Componente para exibir conteúdo do CMS com fallback
 * Busca do Supabase em runtime, mas sempre mostra fallback primeiro
 */
export default function ConteudoText({
    chave,
    fallback,
    className = "",
    as: Component = "span",
}: ConteudoTextProps) {
    const [texto, setTexto] = useState(fallback);

    useEffect(() => {
        // Buscar do Supabase apenas no cliente
        async function buscar() {
            try {
                const response = await fetch(`/api/conteudos?chave=${encodeURIComponent(chave)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.data?.texto) {
                        setTexto(data.data.texto);
                    }
                }
            } catch (error) {
                // Em caso de erro, manter fallback
                console.warn(`Erro ao buscar conteúdo "${chave}":`, error);
            }
        }

        buscar();
    }, [chave]);

    return <Component className={className}>{texto}</Component>;
}

