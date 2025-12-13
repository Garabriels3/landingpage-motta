"use client";

import { useEffect, useState, useCallback } from "react";

interface ConteudoTextProps {
    chave: string;
    fallback: string;
    className?: string;
    as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "label";
    /** Se true, mostra skeleton enquanto carrega ao invés do fallback */
    showSkeleton?: boolean;
}

// Evento global para forçar atualização de todos os conteúdos
const CONTEUDO_UPDATE_EVENT = 'conteudo-atualizado';

/**
 * Componente Skeleton com shimmer animado
 * Adapta o tamanho baseado no tipo de elemento
 */
function TextSkeleton({
    className = "",
    elementType = "span"
}: {
    className?: string;
    elementType?: string;
}) {
    // Definir largura baseada no tipo de elemento
    const getWidth = () => {
        switch (elementType) {
            case 'h1': return 'min-w-[200px] w-3/4';
            case 'h2': return 'min-w-[180px] w-2/3';
            case 'h3':
            case 'h4': return 'min-w-[150px] w-1/2';
            case 'p': return 'min-w-[120px] w-full';
            case 'label': return 'min-w-[80px] w-24';
            default: return 'min-w-[60px] w-20';
        }
    };

    // Definir altura baseada no tipo
    const getHeight = () => {
        switch (elementType) {
            case 'h1': return 'h-10 md:h-12';
            case 'h2': return 'h-8 md:h-10';
            case 'h3':
            case 'h4': return 'h-6 md:h-7';
            case 'p': return 'h-5';
            default: return 'h-4';
        }
    };

    return (
        <span
            className={`inline-block bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-shimmer bg-[length:200%_100%] ${getWidth()} ${getHeight()} ${className}`}
            aria-hidden="true"
        />
    );
}

/**
 * Componente para exibir conteúdo do CMS com skeleton loading
 * Mostra shimmer enquanto busca do Supabase, depois exibe o texto real
 * 
 * Para forçar atualização de todos os conteúdos após edição no admin:
 * window.dispatchEvent(new Event('conteudo-atualizado'))
 */
export default function ConteudoText({
    chave,
    fallback,
    className = "",
    as: Component = "span",
    showSkeleton = true,
}: ConteudoTextProps) {
    const [texto, setTexto] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(Date.now());

    // Função de busca com cache busting
    const buscar = useCallback(async (isInitialLoad = false) => {
        // Só mostrar loading no carregamento inicial
        if (isInitialLoad) {
            setCarregando(true);
        }

        try {
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
                } else {
                    // Se não encontrar no banco, usar fallback
                    setTexto(fallback);
                }
            } else {
                // Em caso de erro HTTP, usar fallback
                setTexto(fallback);
            }
        } catch (error) {
            console.warn(`Erro ao buscar conteúdo "${chave}":`, error);
            // Em caso de erro, usar fallback
            setTexto(fallback);
        } finally {
            setCarregando(false);
        }
    }, [chave, fallback]);

    // Buscar conteúdo inicial
    useEffect(() => {
        buscar(true);
    }, [buscar]);

    // Buscar quando houver atualizações (sem mostrar loading)
    useEffect(() => {
        // Pular a primeira execução (já foi feita pelo useEffect acima)
        if (ultimaAtualizacao === 0) return;

        const timer = setTimeout(() => {
            buscar(false);
        }, 100);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ultimaAtualizacao]);

    // Escutar evento de atualização global
    useEffect(() => {
        const handleConteudoAtualizado = () => {
            setUltimaAtualizacao(Date.now());
        };

        window.addEventListener(CONTEUDO_UPDATE_EVENT, handleConteudoAtualizado);

        // Recarregar periodicamente (60 segundos)
        const interval = setInterval(() => {
            setUltimaAtualizacao(Date.now());
        }, 60000);

        return () => {
            window.removeEventListener(CONTEUDO_UPDATE_EVENT, handleConteudoAtualizado);
            clearInterval(interval);
        };
    }, []);

    // Mostrar skeleton enquanto carrega
    if (carregando && showSkeleton) {
        return <Component className={className}><TextSkeleton elementType={Component} /></Component>;
    }

    return <Component className={className}>{texto || fallback}</Component>;
}

// Exportar função utilitária para forçar atualização
export function forcarAtualizacaoConteudos() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(CONTEUDO_UPDATE_EVENT));
    }
}

/**
 * Hook para carregar URLs dinâmicas do CMS
 * Usado para links que precisam ser editáveis pelo admin
 * 
 * @param chave - Chave do conteúdo no banco (ex: 'confirmacao.tjrj.link')
 * @param fallbackUrl - URL padrão caso não encontre no banco
 * @returns URL atual do conteúdo
 */
export function useConteudoLink(chave: string, fallbackUrl: string): string {
    const [url, setUrl] = useState<string>(fallbackUrl);

    useEffect(() => {
        const buscarLink = async () => {
            try {
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
                        setUrl(data.data.texto);
                    }
                }
            } catch (error) {
                console.warn(`Erro ao buscar link "${chave}":`, error);
                // Em caso de erro, manter fallback
            }
        };

        buscarLink();

        // Recarregar quando houver atualização de conteúdo
        const handleUpdate = () => buscarLink();
        window.addEventListener(CONTEUDO_UPDATE_EVENT, handleUpdate);

        // Recarregar periodicamente (60 segundos)
        const interval = setInterval(() => {
            buscarLink();
        }, 60000);

        return () => {
            window.removeEventListener(CONTEUDO_UPDATE_EVENT, handleUpdate);
            clearInterval(interval);
        };
    }, [chave, fallbackUrl]);

    return url;
}
