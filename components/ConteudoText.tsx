"use client";

import { useEffect, useState } from "react";

interface ConteudoTextProps {
    chave: string;
    fallback: string;
    className?: string;
    as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "label";
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
                // Cache busting para forçar atualização
                const timestamp = Date.now();
                const response = await fetch(
                    `/api/conteudos?chave=${encodeURIComponent(chave)}&_t=${timestamp}`,
                    {
                        cache: 'no-store',
                        headers: {
                            'Cache-Control': 'no-cache',
                        },
                    }
                );
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
        
        // Recarregar a cada 30 segundos para pegar atualizações
        const interval = setInterval(buscar, 30000);
        return () => clearInterval(interval);
    }, [chave]);

    return <Component className={className}>{texto}</Component>;
}

