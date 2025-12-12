"use client";

import { useEffect, useState, useCallback } from "react";

interface ConteudoTextProps {
    chave: string;
    fallback: string;
    className?: string;
    as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "label";
}

// Evento global para forçar atualização de todos os conteúdos
// Pode ser disparado de qualquer lugar: window.dispatchEvent(new Event('conteudo-atualizado'))
const CONTEUDO_UPDATE_EVENT = 'conteudo-atualizado';

/**
 * Componente para exibir conteúdo do CMS com fallback
 * Busca do Supabase em runtime, mas sempre mostra fallback primeiro
 * 
 * Para forçar atualização de todos os conteúdos após edição no admin:
 * window.dispatchEvent(new Event('conteudo-atualizado'))
 */
export default function ConteudoText({
    chave,
    fallback,
    className = "",
    as: Component = "span",
}: ConteudoTextProps) {
    const [texto, setTexto] = useState(fallback);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(Date.now());

    // Função de busca com cache busting
    const buscar = useCallback(async () => {
        try {
            // Cache busting forte: usa timestamp único + random
            const cacheBuster = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const response = await fetch(
                `/api/conteudos?chave=${encodeURIComponent(chave)}&_=${cacheBuster}`,
                {
                    cache: 'no-store',
                    next: { revalidate: 0 },
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
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
    }, [chave]);

    // Buscar conteúdo inicial e quando houver atualizações
    useEffect(() => {
        buscar();
    }, [buscar, ultimaAtualizacao]);

    // Escutar evento de atualização global
    useEffect(() => {
        const handleConteudoAtualizado = () => {
            // Forçar nova busca imediatamente
            setUltimaAtualizacao(Date.now());
        };

        window.addEventListener(CONTEUDO_UPDATE_EVENT, handleConteudoAtualizado);

        // Também recarregar periodicamente (mas menos frequentemente)
        const interval = setInterval(() => {
            setUltimaAtualizacao(Date.now());
        }, 60000); // 60 segundos ao invés de 30

        return () => {
            window.removeEventListener(CONTEUDO_UPDATE_EVENT, handleConteudoAtualizado);
            clearInterval(interval);
        };
    }, []);

    return <Component className={className}>{texto}</Component>;
}

// Exportar função utilitária para forçar atualização
export function forcarAtualizacaoConteudos() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(CONTEUDO_UPDATE_EVENT));
    }
}


