"use client";

import { useEffect, useState } from "react";

// Tipos
type ConteudoTexto = {
    id: string;
    chave: string;
    texto: string;
    descricao: string;
    tipo: "linha" | "paragrafo";
    pagina: string;
};

type Consentimento = {
    id: string;
    nome_fornecido: string;
    email_fornecido: string;
    cpf: string;
    aceitou_termos: boolean;
    source_campaign: string;
    created_at: string;
};

type Caso = {
    id: string;

    // === INFORMAÇÕES DO PROCESSO ===
    NUMERO_PROCESSO: string;
    TIPO_PROCESSO?: string;
    DATA_DISTRIBUICAO?: string;
    TERMO_PESQUISADO?: string;
    TRIBUNAL?: string;
    FORUM?: string;
    VARA?: string;
    VALOR?: string;
    DATA_AUDIENCIA?: string;
    PROCESSO_ELETRONICO?: string;
    INSTANCIA?: number;
    LINK_DOCUMENTOS?: string;
    ASSUNTO?: string;
    AUTOR?: string;

    // === DADOS DO RÉU ===
    REU: string;
    DOC_REU?: number;
    TIPO_DOC?: string;
    NOME_RAZAO?: string;
    NOME_MAE_FANTASIA?: string;
    DT_NASC_ABERTURA?: string;
    SITUACAO_RECEITA?: string;
    SEXO_PORTE?: string;
    RENDA_FATURAMENTO_PRESUMIDO?: number;
    CBO_CNAE?: number;
    ESTADO_CIVIL_MATRIZ?: string;
    SIGNO_NJUR?: string;

    // === CONTATO ===
    EMAIL?: string;
    DDD1?: number;
    FONE1?: number;
    DDD2?: number;
    FONE2?: number;
    DDD3?: number;
    FONE3?: number;
    DDD4?: number;
    FONE4?: number;

    // === ENDEREÇO COMPLETO ===
    ENDERECO?: string;
    TIPO_LOGR?: string;
    TITULO_LOGR?: string;
    LOGRADOURO?: string;
    NUMERO?: string;
    COMPLEMENTO?: string;
    BAIRRO?: string;
    CIDADE?: string;
    UF?: string;
    CEP?: number;
    CIDADE_REU?: string;
    UF_REU?: string;

    // === ADVOGADO ===
    ADVOGADO?: string;

    // === SÓCIOS ===
    SOCIO1_DOC?: string;
    SOCIO1_NOME_RAZAO?: string;
    SOCIO1_TEL?: string;
    SOCIO1_EMAIL?: string;
    SOCIO2_DOC?: string;
    SOCIO2_NOME_RAZAO?: string;
    SOCIO2_TEL?: string;
    SOCIO2_EMAIL?: string;
    SOCIO3_DOC?: string;
    SOCIO3_NOME_RAZAO?: string;
    SOCIO3_TEL?: string;
    SOCIO3_EMAIL?: string;

    // === CONSENTIMENTO ===
    consentimento_id?: string;
    [key: string]: any;
};

// Configuração das páginas para organizar a edição
const PAGINAS_CONFIG: Record<string, { nome: string; icone: string }> = {
    "home": { nome: "Home (Página Inicial)", icone: "home" },
    "confirmacao": { nome: "Confirmação (Resultado)", icone: "check_circle" },
    "header": { nome: "Header (Navegação)", icone: "menu" },
};

export default function AdminConteudosPage() {
    // ============================================
    // CONSTANTES DE SEGURANÇA
    // ============================================
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

    // ============================================
    // ESTADOS
    // ============================================
    const [autenticado, setAutenticado] = useState(false);
    const [verificandoAuth, setVerificandoAuth] = useState(true);
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [activeTab, setActiveTab] = useState<"textos" | "cadastros" | "casos">("textos");

    // Estados - Conteúdos
    const [conteudos, setConteudos] = useState<ConteudoTexto[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [alteracoesPendentes, setAlteracoesPendentes] = useState<Record<string, string>>({});
    const [salvando, setSalvando] = useState(false);
    const [filtroPagina, setFiltroPagina] = useState<string>("all");

    // Estados - Cadastros/Consentimentos
    const [consentimentos, setConsentimentos] = useState<Consentimento[]>([]);
    const [carregandoConsentimentos, setCarregandoConsentimentos] = useState(false);
    const [totalConsentimentos, setTotalConsentimentos] = useState(0);
    const [buscaConsentimentos, setBuscaConsentimentos] = useState('');
    const [consentimentoSelecionado, setConsentimentoSelecionado] = useState<Consentimento | null>(null);
    const [paginaConsentimentos, setPaginaConsentimentos] = useState(0);

    // Estados - Casos
    const [casos, setCasos] = useState<Caso[]>([]);
    const [carregandoCasos, setCarregandoCasos] = useState(false);
    const [totalCasos, setTotalCasos] = useState(0);
    const [buscaCasos, setBuscaCasos] = useState('');
    const [casoSelecionado, setCasoSelecionado] = useState<Caso | null>(null);
    const [paginaCasos, setPaginaCasos] = useState(0);

    // ============================================
    // FUNÇÕES DE SESSÃO SEGURA
    // ============================================
    const getSecureSession = () => {
        try {
            const sessionData = sessionStorage.getItem("admin_session");
            if (!sessionData) return null;

            const session = JSON.parse(sessionData);
            const now = Date.now();

            // Verificar expiração (30 minutos)
            if (now - session.timestamp > SESSION_TIMEOUT_MS) {
                sessionStorage.removeItem("admin_session");
                return null;
            }

            return session.token;
        } catch {
            sessionStorage.removeItem("admin_session");
            return null;
        }
    };

    const setSecureSession = (token: string) => {
        const sessionData = {
            token,
            timestamp: Date.now()
        };
        sessionStorage.setItem("admin_session", JSON.stringify(sessionData));
        // Migra localStorage antigo se existir
        localStorage.removeItem("admin_token");
    };

    const clearSecureSession = () => {
        sessionStorage.removeItem("admin_session");
        localStorage.removeItem("admin_token");
    };

    const refreshSessionTimestamp = () => {
        const token = getSecureSession();
        if (token) {
            setSecureSession(token);
        }
    };

    // ============================================
    // EFEITOS (USE EFFECT)
    // ============================================
    useEffect(() => {
        // Migra sessão antiga do localStorage se existir
        const oldToken = localStorage.getItem("admin_token");
        if (oldToken) {
            setSecureSession(oldToken);
        }

        const token = getSecureSession();
        if (token) {
            verificarToken(token);
        } else {
            setVerificandoAuth(false);
        }
    }, []);

    // Carregar dados ao trocar de aba se autenticado
    useEffect(() => {
        if (autenticado) {
            const token = getSecureSession();
            if (token) {
                refreshSessionTimestamp(); // Renova sessão a cada ação
                if (activeTab === "cadastros") {
                    carregarConsentimentos(token);
                } else if (activeTab === "casos") {
                    carregarCasos(token);
                }
            }
        }
    }, [activeTab, autenticado]);

    // Recarregar conteúdos quando filtro de página muda
    useEffect(() => {
        if (autenticado && activeTab === "textos") {
            const token = getSecureSession();
            if (token) carregarConteudos(token);
        }
    }, [filtroPagina]);

    // ============================================
    // FUNÇÕES AUXILIARES
    // ============================================

    // AUTH
    const verificarToken = async (token: string) => {
        try {
            const response = await fetch("/api/admin/conteudos?limit=1", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setAutenticado(true);
                carregarConteudos(token);
            } else {
                clearSecureSession();
            }
        } catch {
            clearSecureSession();
        } finally {
            setVerificandoAuth(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");
        try {
            const response = await fetch("/api/admin/conteudos?limit=1", {
                headers: { Authorization: `Bearer ${senha}` },
            });
            if (response.ok) {
                setSecureSession(senha);
                setAutenticado(true);
                carregarConteudos(senha);
            } else {
                setErro("Senha incorreta");
            }
        } catch {
            setErro("Erro ao conectar com o servidor");
        }
    };

    const handleLogout = () => {
        clearSecureSession();
        setAutenticado(false);
        setSenha("");
    };

    // CONTEÚDOS (TEXTOS)
    const carregarConteudos = async (token: string) => {
        setCarregando(true);
        try {
            const url = filtroPagina !== "all"
                ? `/api/admin/conteudos?pagina=${encodeURIComponent(filtroPagina)}`
                : "/api/admin/conteudos";

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });

            if (response.ok) {
                const result = await response.json();
                setConteudos(result.data || []);
                // Limpa alterações pendentes ao recarregar
                setAlteracoesPendentes({});
            }
        } catch (error) {
            console.error("Erro ao carregar conteúdos:", error);
        } finally {
            setCarregando(false);
        }
    };

    const handleTextoChange = (chave: string, novoTexto: string) => {
        setAlteracoesPendentes(prev => ({
            ...prev,
            [chave]: novoTexto
        }));
    };

    const salvarAlteracoes = async () => {
        const token = getSecureSession();
        if (!token) return;

        setSalvando(true);
        try {
            const updates = Object.entries(alteracoesPendentes).map(async ([chave, texto]) => {
                // Encontra o ID original se necessário ou manda a chave
                const response = await fetch("/api/admin/conteudos", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ chave, texto })
                });
                if (!response.ok) throw new Error(`Falha ao salvar ${chave}`);
            });

            await Promise.all(updates);

            // Recarrega tudo
            await carregarConteudos(token);
            alert("Alterações salvas com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar algumas alterações. Verifique o console.");
        } finally {
            setSalvando(false);
        }
    };

    const descartarAlteracoes = () => {
        if (confirm("Tem certeza? Todas as edições não salvas serão perdidas.")) {
            setAlteracoesPendentes({});
        }
    };

    // CADASTROS / CONSENTIMENTOS
    const carregarConsentimentos = async (token: string, page = 0, search = '') => {
        setCarregandoConsentimentos(true);
        try {
            const params = new URLSearchParams();
            params.append("page", String(page + 1)); // API usa 1-indexed
            params.append("limit", "50");
            if (search) params.append("q", search);

            const response = await fetch(`/api/admin/consentimentos?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            if (response.ok) {
                const data = await response.json();
                setConsentimentos(data.data || []);
                setTotalConsentimentos(data.total || 0);
            }
        } catch (error) {
            console.error("Erro ao carregar consentimentos:", error);
        } finally {
            setCarregandoConsentimentos(false);
        }
    };

    const mascararCPF = (cpf: string) => {
        if (!cpf) return "—";
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4");
    };

    // CASOS
    const carregarCasos = async (token: string, page = 0, search = '') => {
        setCarregandoCasos(true);
        try {
            const params = new URLSearchParams();
            params.append("page", String(page));
            params.append("limit", "50");
            if (search) params.append("q", search);

            const response = await fetch(`/api/admin/casos?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });

            if (response.ok) {
                const data = await response.json();
                setCasos(data.data || []);
                setTotalCasos(data.total || 0);
            }
        } catch (error) {
            console.error("Erro ao carregar casos:", error);
        } finally {
            setCarregandoCasos(false);
        }
    };


    const handleBuscaCasos = (e: React.FormEvent) => {
        e.preventDefault();
        const token = getSecureSession();
        setPaginaCasos(0); // Reset to first page on search
        if (token) carregarCasos(token, 0, buscaCasos);
    };

    const handleBuscaConsentimentos = (e: React.FormEvent) => {
        e.preventDefault();
        const token = getSecureSession();
        setPaginaConsentimentos(0);
        if (token) carregarConsentimentos(token, 0, buscaConsentimentos);
    };

    // Funções de paginação para Casos
    const totalPaginasCasos = Math.ceil(totalCasos / 50);
    const irParaPaginaCasos = (page: number) => {
        const token = getSecureSession();
        if (token && page >= 0 && page < totalPaginasCasos) {
            setPaginaCasos(page);
            setCasoSelecionado(null);
            carregarCasos(token, page, buscaCasos);
        }
    };

    // Funções de paginação para Consentimentos
    const totalPaginasConsentimentos = Math.ceil(totalConsentimentos / 50);
    const irParaPaginaConsentimentos = (page: number) => {
        const token = getSecureSession();
        if (token && page >= 0 && page < totalPaginasConsentimentos) {
            setPaginaConsentimentos(page);
            setConsentimentoSelecionado(null);
            carregarConsentimentos(token, page, buscaConsentimentos);
        }
    };


    // ============================================
    // FUNÇÕES DE VIEW
    // ============================================

    // Agrupa conteúdos por página (com proteção caso não seja array)
    const conteudosPorPagina = (Array.isArray(conteudos) ? conteudos : []).reduce((acc, curr) => {
        if (!acc[curr.pagina]) acc[curr.pagina] = [];
        acc[curr.pagina].push(curr);
        return acc;
    }, {} as Record<string, ConteudoTexto[]>);

    // Helper para pegar valor atual (editado ou original)
    const getTextoAtual = (conteudo: ConteudoTexto) => {
        if (alteracoesPendentes[conteudo.chave] !== undefined) {
            return alteracoesPendentes[conteudo.chave];
        }
        return conteudo.texto;
    };

    const temAlteracoesNaoSalvas = Object.keys(alteracoesPendentes).length > 0;

    // ============================================
    // RENDER: LOGIN SCREEN
    // ============================================
    if (!autenticado) {
        if (verificandoAuth) {
            return (
                <div className="min-h-screen bg-[#1e1a14] flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-[#1e1a14] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#2a261f] rounded-2xl border border-white/10 p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full mx-auto flex items-center justify-center shadow-lg mb-4">
                            <span className="text-black text-2xl font-bold">W</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Acesso Administrativo</h1>
                        <p className="text-gray-400">Entre com sua credencial para continuar</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="Senha de acesso"
                                className="w-full bg-[#1e1a14] border border-white/10 rounded-lg h-12 px-4 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                            />
                        </div>

                        {erro && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm text-center">
                                {erro}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full h-12 bg-primary hover:bg-primary-dark text-black font-bold rounded-lg transition-colors"
                        >
                            Entrar no Painel
                        </button>
                    </form>

                    <p className="text-center text-gray-600 text-xs mt-6">
                        Acesso restrito a administradores autorizados.
                    </p>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER: PAINEL ADMIN MAIN
    // ============================================
    return (
        <div className="flex h-screen w-full bg-[#1e1a14] text-white overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-[#2a261f] border-r border-white/5 flex flex-col justify-between shrink-0 h-full">
                <div className="flex flex-col gap-6 p-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md border border-white/10">
                            <span className="text-black font-bold text-lg">W</span>
                        </div>
                        <div>
                            <h1 className="text-white text-base font-semibold leading-tight tracking-tight">
                                Wagner Chaves
                            </h1>
                            <p className="text-primary text-xs font-medium">Painel Administrativo</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab("textos")}
                            className={`flex items-center gap-3 h-12 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === "textos"
                                ? "bg-primary text-black shadow-lg shadow-primary/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <span className="material-symbols-outlined">edit_document</span>
                            Gerenciar Textos
                        </button>
                        <button
                            onClick={() => setActiveTab("casos")}
                            className={`flex items-center gap-3 h-12 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === "casos"
                                ? "bg-primary text-black shadow-lg shadow-primary/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <span className="material-symbols-outlined">folder_managed</span>
                            Gestão de Casos
                        </button>
                        <button
                            onClick={() => setActiveTab("cadastros")}
                            className={`flex items-center gap-3 h-12 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === "cadastros"
                                ? "bg-primary text-black shadow-lg shadow-primary/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <span className="material-symbols-outlined">group</span>
                            Cadastros Recebidos
                        </button>
                    </nav>
                </div>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 h-12 px-4 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Sair do Painel
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-full min-w-0 flex flex-col relative">

                {/* ========================================
                    ABA: GESTÃO DE CASOS (NOVO)
                    ======================================== */}
                {activeTab === "casos" && (
                    <>
                        {/* Top Header */}
                        <header className="w-full bg-[#1e1a14]/95 backdrop-blur-sm border-b border-white/5 z-10 sticky top-0">
                            <div className="max-w-6xl mx-auto px-6 py-6 w-full">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-white text-3xl font-bold tracking-tight">
                                            Gestão de Casos
                                        </h2>
                                        <p className="text-gray-400 text-sm">
                                            Base de processos e status de consentimento dos clientes.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <form onSubmit={handleBuscaCasos} className="relative">
                                            <input
                                                type="text"
                                                placeholder="Nome, CPF ou Email..."
                                                value={buscaCasos}
                                                onChange={(e) => setBuscaCasos(e.target.value)}
                                                className="bg-[#2a261f] border border-white/10 rounded-lg h-10 pl-4 pr-10 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none w-64"
                                            />
                                            <button type="submit" className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white">
                                                <span className="material-symbols-outlined text-[20px]">search</span>
                                            </button>
                                        </form>

                                        <button
                                            onClick={() => {
                                                const token = getSecureSession();
                                                if (token) carregarCasos(token, paginaCasos, buscaCasos);
                                            }}
                                            className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#2a261f] border border-white/10 text-gray-300 hover:text-white hover:border-primary/50 text-sm font-medium transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                                            Atualizar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#332d25 #1e1a14' }}>
                            <div className="max-w-6xl mx-auto w-full pb-20">
                                {carregandoCasos ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    </div>
                                ) : casos.length === 0 ? (
                                    <div className="bg-[#2a261f] rounded-xl border border-white/5 p-12 text-center">
                                        <span className="material-symbols-outlined text-gray-600 text-5xl mb-4">folder_off</span>
                                        <p className="text-gray-400">Nenhum caso encontrado.</p>
                                    </div>
                                ) : (
                                    <div className="flex gap-6">
                                        {/* Lista de casos */}
                                        <div className={`transition-all duration-300 ${casoSelecionado ? 'w-[55%]' : 'w-full'}`}>
                                            <div className="bg-[#2a261f] rounded-xl border border-white/5 overflow-hidden">
                                                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#1e1a14] border-b border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    <div className="col-span-1 text-center">Status</div>
                                                    <div className="col-span-4">Réu / Nome</div>
                                                    <div className="col-span-4">Email</div>
                                                    <div className="col-span-3 text-right">Processo</div>
                                                </div>

                                                <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                                    {casos.map((caso) => {
                                                        const temConsentimento = !!caso.consentimento_id;
                                                        const isSelected = casoSelecionado?.id === caso.id;

                                                        return (
                                                            <div
                                                                key={caso.id}
                                                                onClick={() => setCasoSelecionado(isSelected ? null : caso)}
                                                                className={`grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer transition-all items-center ${isSelected ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-white/5'}`}
                                                            >
                                                                <div className="col-span-1 flex justify-center">
                                                                    {temConsentimento ? (
                                                                        <span className="material-symbols-outlined text-green-500" title="Consentimento Confirmado">check_circle</span>
                                                                    ) : (
                                                                        <span className="material-symbols-outlined text-gray-600" title="Aguardando Cadastro">pending</span>
                                                                    )}
                                                                </div>
                                                                <div className="col-span-4">
                                                                    <div className="text-white font-medium truncate" title={caso.REU}>{caso.REU}</div>
                                                                </div>
                                                                <div className="col-span-4">
                                                                    <div className="text-gray-400 text-sm truncate" title={caso.EMAIL}>{caso.EMAIL || "-"}</div>
                                                                </div>
                                                                <div className="col-span-3 text-right">
                                                                    <div className="text-primary font-mono text-sm truncate" title={caso.NUMERO_PROCESSO}>{caso.NUMERO_PROCESSO}</div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                {/* Paginação */}
                                                <div className="px-6 py-4 border-t border-white/5 bg-[#1e1a14]/50 flex items-center justify-between">
                                                    <div className="text-xs text-gray-500">
                                                        Mostrando {casos.length} de {totalCasos} resultados
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => irParaPaginaCasos(paginaCasos - 1)}
                                                            disabled={paginaCasos === 0}
                                                            className="h-8 px-3 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            ← Anterior
                                                        </button>
                                                        <span className="text-xs text-gray-400 px-2">
                                                            Página {paginaCasos + 1} de {totalPaginasCasos || 1}
                                                        </span>
                                                        <button
                                                            onClick={() => irParaPaginaCasos(paginaCasos + 1)}
                                                            disabled={paginaCasos >= totalPaginasCasos - 1}
                                                            className="h-8 px-3 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            Próxima →
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card de Detalhes */}
                                        <div className={`transition-all duration-300 overflow-hidden ${casoSelecionado ? 'w-[45%] opacity-100' : 'w-0 opacity-0'}`}>
                                            {casoSelecionado && (
                                                <div className="bg-[#2a261f] rounded-xl border border-white/5 h-fit sticky top-6 max-h-[85vh] flex flex-col">
                                                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                                                        <h3 className="text-lg font-bold text-white">Detalhes do Caso</h3>
                                                        <button
                                                            onClick={() => setCasoSelecionado(null)}
                                                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                                        </button>
                                                    </div>

                                                    <div className="overflow-y-auto p-6 space-y-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#332d25 #1e1a14' }}>

                                                        {/* ========== SEÇÃO 1: IDENTIFICAÇÃO DO RÉU ========== */}
                                                        <div>
                                                            <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[18px]">person</span>
                                                                Identificação do Réu
                                                            </h4>
                                                            <div className="space-y-2">
                                                                <div>
                                                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Nome / Réu</label>
                                                                    <p className="text-white font-medium mt-1">{casoSelecionado.REU}</p>
                                                                </div>
                                                                {casoSelecionado.NOME_RAZAO && (
                                                                    <div>
                                                                        <label className="text-xs text-gray-500 uppercase tracking-wider">Razão Social</label>
                                                                        <p className="text-gray-300 mt-1">{casoSelecionado.NOME_RAZAO}</p>
                                                                    </div>
                                                                )}
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {casoSelecionado.DOC_REU && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">CPF/CNPJ</label>
                                                                            <p className="text-gray-300 font-mono text-sm mt-1">{casoSelecionado.DOC_REU}</p>
                                                                        </div>
                                                                    )}
                                                                    {casoSelecionado.TIPO_DOC && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Tipo Doc</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.TIPO_DOC}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {casoSelecionado.NOME_MAE_FANTASIA && (
                                                                    <div>
                                                                        <label className="text-xs text-gray-500 uppercase tracking-wider">Mãe / Nome Fantasia</label>
                                                                        <p className="text-gray-300 mt-1">{casoSelecionado.NOME_MAE_FANTASIA}</p>
                                                                    </div>
                                                                )}
                                                                {casoSelecionado.DT_NASC_ABERTURA && (
                                                                    <div>
                                                                        <label className="text-xs text-gray-500 uppercase tracking-wider">Data Nasc. / Abertura</label>
                                                                        <p className="text-gray-300 mt-1">{casoSelecionado.DT_NASC_ABERTURA}</p>
                                                                    </div>
                                                                )}
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {casoSelecionado.SEXO_PORTE && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Sexo / Porte</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.SEXO_PORTE}</p>
                                                                        </div>
                                                                    )}
                                                                    {casoSelecionado.ESTADO_CIVIL_MATRIZ && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Est. Civil / Matriz</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.ESTADO_CIVIL_MATRIZ}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* ========== SEÇÃO 2: SITUAÇÃO RECEITA (PJ) ========== */}
                                                        {(casoSelecionado.SITUACAO_RECEITA || casoSelecionado.CBO_CNAE || casoSelecionado.RENDA_FATURAMENTO_PRESUMIDO || casoSelecionado.SIGNO_NJUR) && (
                                                            <div className="pt-4 border-t border-white/10">
                                                                <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-[18px]">account_balance</span>
                                                                    Dados Receita Federal
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {casoSelecionado.SITUACAO_RECEITA && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Situação Receita</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.SITUACAO_RECEITA}</p>
                                                                        </div>
                                                                    )}
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {casoSelecionado.CBO_CNAE && (
                                                                            <div>
                                                                                <label className="text-xs text-gray-500 uppercase tracking-wider">CBO / CNAE</label>
                                                                                <p className="text-gray-300 font-mono text-sm mt-1">{casoSelecionado.CBO_CNAE}</p>
                                                                            </div>
                                                                        )}
                                                                        {casoSelecionado.SIGNO_NJUR && (
                                                                            <div>
                                                                                <label className="text-xs text-gray-500 uppercase tracking-wider">Signo / Nat. Jurídica</label>
                                                                                <p className="text-gray-300 mt-1">{casoSelecionado.SIGNO_NJUR}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {casoSelecionado.RENDA_FATURAMENTO_PRESUMIDO && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Renda / Faturamento</label>
                                                                            <p className="text-gray-300 mt-1">R$ {casoSelecionado.RENDA_FATURAMENTO_PRESUMIDO?.toLocaleString('pt-BR')}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* ========== SEÇÃO 3: CONTATOS ========== */}
                                                        {(casoSelecionado.EMAIL || casoSelecionado.FONE1) && (
                                                            <div className="pt-4 border-t border-white/10">
                                                                <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-[18px]">contact_phone</span>
                                                                    Contatos
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {casoSelecionado.EMAIL && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.EMAIL}</p>
                                                                        </div>
                                                                    )}
                                                                    {(casoSelecionado.FONE1 || casoSelecionado.FONE2 || casoSelecionado.FONE3 || casoSelecionado.FONE4) && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Telefones</label>
                                                                            <div className="grid grid-cols-2 gap-1 text-sm">
                                                                                {casoSelecionado.FONE1 && <p className="text-gray-300">📞 ({casoSelecionado.DDD1}) {casoSelecionado.FONE1}</p>}
                                                                                {casoSelecionado.FONE2 && <p className="text-gray-300">📞 ({casoSelecionado.DDD2}) {casoSelecionado.FONE2}</p>}
                                                                                {casoSelecionado.FONE3 && <p className="text-gray-300">📞 ({casoSelecionado.DDD3}) {casoSelecionado.FONE3}</p>}
                                                                                {casoSelecionado.FONE4 && <p className="text-gray-300">📞 ({casoSelecionado.DDD4}) {casoSelecionado.FONE4}</p>}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* ========== SEÇÃO 4: ENDEREÇO COMPLETO ========== */}
                                                        {(casoSelecionado.ENDERECO || casoSelecionado.LOGRADOURO || casoSelecionado.CIDADE) && (
                                                            <div className="pt-4 border-t border-white/10">
                                                                <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                                    Endereço
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {casoSelecionado.ENDERECO && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Endereço Completo</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.ENDERECO}</p>
                                                                        </div>
                                                                    )}
                                                                    {(casoSelecionado.TIPO_LOGR || casoSelecionado.TITULO_LOGR || casoSelecionado.LOGRADOURO) && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Logradouro</label>
                                                                            <p className="text-gray-300 mt-1">
                                                                                {[casoSelecionado.TIPO_LOGR, casoSelecionado.TITULO_LOGR, casoSelecionado.LOGRADOURO].filter(Boolean).join(' ')}
                                                                                {casoSelecionado.NUMERO && `, ${casoSelecionado.NUMERO}`}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                    {casoSelecionado.COMPLEMENTO && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Complemento</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.COMPLEMENTO}</p>
                                                                        </div>
                                                                    )}
                                                                    {casoSelecionado.BAIRRO && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Bairro</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.BAIRRO}</p>
                                                                        </div>
                                                                    )}
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        {(casoSelecionado.CIDADE || casoSelecionado.CIDADE_REU) && (
                                                                            <div>
                                                                                <label className="text-xs text-gray-500 uppercase tracking-wider">Cidade</label>
                                                                                <p className="text-gray-300 mt-1">{casoSelecionado.CIDADE || casoSelecionado.CIDADE_REU}</p>
                                                                            </div>
                                                                        )}
                                                                        {(casoSelecionado.UF || casoSelecionado.UF_REU) && (
                                                                            <div>
                                                                                <label className="text-xs text-gray-500 uppercase tracking-wider">UF</label>
                                                                                <p className="text-gray-300 mt-1">{casoSelecionado.UF || casoSelecionado.UF_REU}</p>
                                                                            </div>
                                                                        )}
                                                                        {casoSelecionado.CEP && (
                                                                            <div>
                                                                                <label className="text-xs text-gray-500 uppercase tracking-wider">CEP</label>
                                                                                <p className="text-gray-300 font-mono text-sm mt-1">{casoSelecionado.CEP}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* ========== SEÇÃO 5: DADOS DO PROCESSO ========== */}
                                                        <div className="pt-4 border-t border-white/10">
                                                            <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[18px]">gavel</span>
                                                                Dados do Processo
                                                            </h4>
                                                            <div className="space-y-2">
                                                                <div>
                                                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Número do Processo</label>
                                                                    <p className="text-primary font-mono font-medium mt-1">{casoSelecionado.NUMERO_PROCESSO}</p>
                                                                </div>
                                                                {casoSelecionado.TIPO_PROCESSO && (
                                                                    <div>
                                                                        <label className="text-xs text-gray-500 uppercase tracking-wider">🔥 Tipo do Processo</label>
                                                                        <p className="text-primary font-semibold mt-1">{casoSelecionado.TIPO_PROCESSO}</p>
                                                                    </div>
                                                                )}
                                                                {casoSelecionado.ASSUNTO && (
                                                                    <div>
                                                                        <label className="text-xs text-gray-500 uppercase tracking-wider">Assunto</label>
                                                                        <p className="text-gray-300 mt-1">{casoSelecionado.ASSUNTO}</p>
                                                                    </div>
                                                                )}
                                                                {casoSelecionado.AUTOR && (
                                                                    <div>
                                                                        <label className="text-xs text-gray-500 uppercase tracking-wider">Autor</label>
                                                                        <p className="text-gray-300 mt-1">{casoSelecionado.AUTOR}</p>
                                                                    </div>
                                                                )}
                                                                {casoSelecionado.VALOR && (
                                                                    <div>
                                                                        <label className="text-xs text-gray-500 uppercase tracking-wider">Valor da Causa</label>
                                                                        <p className="text-gray-300 mt-1">{casoSelecionado.VALOR}</p>
                                                                    </div>
                                                                )}
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {casoSelecionado.DATA_DISTRIBUICAO && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Distribuição</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.DATA_DISTRIBUICAO}</p>
                                                                        </div>
                                                                    )}
                                                                    {casoSelecionado.DATA_AUDIENCIA && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">📅 Audiência</label>
                                                                            <p className="text-yellow-400 font-medium mt-1">{casoSelecionado.DATA_AUDIENCIA}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* ========== SEÇÃO 6: TRIBUNAL / FÓRUM / VARA ========== */}
                                                        {(casoSelecionado.TRIBUNAL || casoSelecionado.FORUM || casoSelecionado.VARA || casoSelecionado.INSTANCIA) && (
                                                            <div className="pt-4 border-t border-white/10">
                                                                <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-[18px]">balance</span>
                                                                    Tribunal / Fórum
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {casoSelecionado.TRIBUNAL && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Tribunal</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.TRIBUNAL}</p>
                                                                        </div>
                                                                    )}
                                                                    {casoSelecionado.FORUM && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Fórum</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.FORUM}</p>
                                                                        </div>
                                                                    )}
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {casoSelecionado.VARA && (
                                                                            <div>
                                                                                <label className="text-xs text-gray-500 uppercase tracking-wider">Vara</label>
                                                                                <p className="text-gray-300 mt-1">{casoSelecionado.VARA}</p>
                                                                            </div>
                                                                        )}
                                                                        {casoSelecionado.INSTANCIA && (
                                                                            <div>
                                                                                <label className="text-xs text-gray-500 uppercase tracking-wider">Instância</label>
                                                                                <p className="text-gray-300 mt-1">{casoSelecionado.INSTANCIA}ª</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {casoSelecionado.PROCESSO_ELETRONICO && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Processo Eletrônico</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.PROCESSO_ELETRONICO}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* ========== SEÇÃO 7: ADVOGADO + LINK ========== */}
                                                        {(casoSelecionado.ADVOGADO || casoSelecionado.LINK_DOCUMENTOS || casoSelecionado.TERMO_PESQUISADO) && (
                                                            <div className="pt-4 border-t border-white/10">
                                                                <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-[18px]">work</span>
                                                                    Advogado / Documentos
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {casoSelecionado.ADVOGADO && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Advogado</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.ADVOGADO}</p>
                                                                        </div>
                                                                    )}
                                                                    {casoSelecionado.TERMO_PESQUISADO && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Termo Pesquisado</label>
                                                                            <p className="text-gray-300 mt-1">{casoSelecionado.TERMO_PESQUISADO}</p>
                                                                        </div>
                                                                    )}
                                                                    {casoSelecionado.LINK_DOCUMENTOS && (
                                                                        <div>
                                                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Link Documentos</label>
                                                                            <a href={casoSelecionado.LINK_DOCUMENTOS} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline mt-1 block truncate">{casoSelecionado.LINK_DOCUMENTOS}</a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* ========== SEÇÃO 8: SÓCIOS ========== */}
                                                        {(casoSelecionado.SOCIO1_NOME_RAZAO || casoSelecionado.SOCIO2_NOME_RAZAO || casoSelecionado.SOCIO3_NOME_RAZAO) && (
                                                            <div className="pt-4 border-t border-white/10">
                                                                <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-[18px]">groups</span>
                                                                    Sócios / Representantes
                                                                </h4>
                                                                <div className="space-y-3">
                                                                    {casoSelecionado.SOCIO1_NOME_RAZAO && (
                                                                        <div className="p-3 bg-white/5 rounded-lg">
                                                                            <p className="text-xs text-primary uppercase tracking-wider mb-1">Sócio 1</p>
                                                                            <p className="text-white font-medium">{casoSelecionado.SOCIO1_NOME_RAZAO}</p>
                                                                            <div className="text-sm text-gray-400 mt-1 space-y-0.5">
                                                                                {casoSelecionado.SOCIO1_DOC && <p>Doc: {casoSelecionado.SOCIO1_DOC}</p>}
                                                                                {casoSelecionado.SOCIO1_TEL && <p>Tel: {casoSelecionado.SOCIO1_TEL}</p>}
                                                                                {casoSelecionado.SOCIO1_EMAIL && <p>{casoSelecionado.SOCIO1_EMAIL}</p>}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {casoSelecionado.SOCIO2_NOME_RAZAO && (
                                                                        <div className="p-3 bg-white/5 rounded-lg">
                                                                            <p className="text-xs text-primary uppercase tracking-wider mb-1">Sócio 2</p>
                                                                            <p className="text-white font-medium">{casoSelecionado.SOCIO2_NOME_RAZAO}</p>
                                                                            <div className="text-sm text-gray-400 mt-1 space-y-0.5">
                                                                                {casoSelecionado.SOCIO2_DOC && <p>Doc: {casoSelecionado.SOCIO2_DOC}</p>}
                                                                                {casoSelecionado.SOCIO2_TEL && <p>Tel: {casoSelecionado.SOCIO2_TEL}</p>}
                                                                                {casoSelecionado.SOCIO2_EMAIL && <p>{casoSelecionado.SOCIO2_EMAIL}</p>}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {casoSelecionado.SOCIO3_NOME_RAZAO && (
                                                                        <div className="p-3 bg-white/5 rounded-lg">
                                                                            <p className="text-xs text-primary uppercase tracking-wider mb-1">Sócio 3</p>
                                                                            <p className="text-white font-medium">{casoSelecionado.SOCIO3_NOME_RAZAO}</p>
                                                                            <div className="text-sm text-gray-400 mt-1 space-y-0.5">
                                                                                {casoSelecionado.SOCIO3_DOC && <p>Doc: {casoSelecionado.SOCIO3_DOC}</p>}
                                                                                {casoSelecionado.SOCIO3_TEL && <p>Tel: {casoSelecionado.SOCIO3_TEL}</p>}
                                                                                {casoSelecionado.SOCIO3_EMAIL && <p>{casoSelecionado.SOCIO3_EMAIL}</p>}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* ========== SEÇÃO 9: CONSENTIMENTO ========== */}
                                                        <div className="pt-4 border-t border-white/10">
                                                            <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                                                                Status do Consentimento
                                                            </h4>
                                                            <div className="flex items-center gap-2">
                                                                {casoSelecionado.consentimento_id ? (
                                                                    <>
                                                                        <span className="material-symbols-outlined text-green-500">verified</span>
                                                                        <span className="text-green-400 font-medium">Consentimento Confirmado</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span className="material-symbols-outlined text-yellow-500">schedule</span>
                                                                        <span className="text-yellow-400">Aguardando Cadastro</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}


                {/* ========================================
                    ABA: TEXTOS (CONTEÚDOS)
                    ======================================== */}
                {activeTab === "textos" && (
                    <>
                        {/* Top Header */}
                        <header className="w-full bg-[#1e1a14]/95 backdrop-blur-sm border-b border-white/5 z-10 sticky top-0">
                            <div className="max-w-5xl mx-auto px-6 py-6 w-full">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-white text-3xl font-bold tracking-tight">
                                            Gerenciar Textos
                                        </h2>
                                        <p className="text-gray-400 text-sm">
                                            Edite os textos do site em tempo real. As alterações aparecem instantaneamente após salvar.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {temAlteracoesNaoSalvas && (
                                            <>
                                                <span className="text-yellow-500 text-xs font-medium bg-yellow-500/10 px-3 py-1.5 rounded-full animate-pulse">
                                                    Há alterações não salvas
                                                </span>
                                                <button
                                                    onClick={descartarAlteracoes}
                                                    className="h-10 px-4 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
                                                    disabled={salvando}
                                                >
                                                    Descartar
                                                </button>
                                                <button
                                                    onClick={salvarAlteracoes}
                                                    className="h-10 px-6 rounded-lg bg-primary hover:bg-primary-dark text-black font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                                                    disabled={salvando}
                                                >
                                                    {salvando ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                            Salvando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-[18px]">save</span>
                                                            Salvar Alterações
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                                    <button
                                        onClick={() => setFiltroPagina("all")}
                                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${filtroPagina === "all"
                                            ? "bg-white text-black"
                                            : "bg-[#2a261f] text-gray-400 hover:text-white hover:bg-[#332d25]"
                                            }`}
                                    >
                                        Todos
                                    </button>
                                    {Object.keys(PAGINAS_CONFIG).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => setFiltroPagina(key)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${filtroPagina === key
                                                ? "bg-white text-black"
                                                : "bg-[#2a261f] text-gray-400 hover:text-white hover:bg-[#332d25]"
                                                }`}
                                        >
                                            {PAGINAS_CONFIG[key].nome}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </header>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#332d25 #1e1a14' }}>
                            <div className="max-w-5xl mx-auto w-full pb-20">
                                {carregando ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    </div>
                                ) : Object.keys(conteudosPorPagina).length === 0 ? (
                                    <div className="bg-[#2a261f] rounded-xl border border-white/5 p-12 text-center">
                                        <span className="material-symbols-outlined text-gray-600 text-5xl mb-4">inbox</span>
                                        <p className="text-gray-400">Nenhum conteúdo encontrado.</p>
                                    </div>
                                ) : (
                                    Object.entries(conteudosPorPagina).map(([pagina, conteudosDaPagina]) => (
                                        <section
                                            key={pagina}
                                            className="flex flex-col gap-4 bg-[#2a261f] rounded-xl border border-white/5 p-6 shadow-sm mb-6"
                                        >
                                            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
                                                <span className="material-symbols-outlined text-primary">
                                                    {PAGINAS_CONFIG[pagina]?.icone || "description"}
                                                </span>
                                                <h3 className="text-white text-lg font-bold">
                                                    Seção: {PAGINAS_CONFIG[pagina]?.nome || pagina}
                                                </h3>
                                                <span className="ml-auto text-xs text-gray-500 bg-[#1e1a14] px-2 py-1 rounded">
                                                    {conteudosDaPagina.length} {conteudosDaPagina.length === 1 ? "item" : "itens"}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {conteudosDaPagina.map((conteudo) => {
                                                    const textoAtual = getTextoAtual(conteudo);
                                                    const foiAlterado = alteracoesPendentes[conteudo.chave] !== undefined &&
                                                        alteracoesPendentes[conteudo.chave] !== conteudo.texto;
                                                    const usarTextarea = conteudo.tipo === "paragrafo" || textoAtual.length > 80;

                                                    return (
                                                        <div
                                                            key={conteudo.id}
                                                            className={`flex flex-col gap-2 ${usarTextarea ? "md:col-span-2" : ""}`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-gray-300 text-sm font-medium">
                                                                    {conteudo.descricao || conteudo.chave}
                                                                </label>
                                                                {foiAlterado && (
                                                                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                                        Modificado
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {usarTextarea ? (
                                                                <textarea
                                                                    value={textoAtual}
                                                                    onChange={(e) => handleTextoChange(conteudo.chave, e.target.value)}
                                                                    className="w-full bg-[#1e1a14] border border-white/10 rounded-lg p-4 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all min-h-[100px] resize-y"
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={textoAtual}
                                                                    onChange={(e) => handleTextoChange(conteudo.chave, e.target.value)}
                                                                    className="w-full bg-[#1e1a14] border border-white/10 rounded-lg h-12 px-4 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                                                />
                                                            )}

                                                            {usarTextarea && (
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-xs text-gray-600 font-mono">
                                                                        {conteudo.chave}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {textoAtual.length} caracteres
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* ========================================
                    ABA: CADASTROS / CONSENTIMENTOS
                    ======================================== */}
                {activeTab === "cadastros" && (
                    <>
                        {/* Top Header */}
                        <header className="w-full bg-[#1e1a14]/95 backdrop-blur-sm border-b border-white/5 z-10 sticky top-0">
                            <div className="max-w-5xl mx-auto px-6 py-6 w-full">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-white text-3xl font-bold tracking-tight">
                                            Cadastros Recebidos
                                        </h2>
                                        <p className="text-gray-400 text-sm">
                                            Pessoas que confirmaram interesse e consentiram com os termos.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#2a261f] border border-white/10 rounded-lg px-4 py-2">
                                            <span className="text-gray-400 text-sm">Total: </span>
                                            <span className="text-primary font-bold">{totalConsentimentos}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const token = getSecureSession();
                                                if (token) carregarConsentimentos(token, paginaConsentimentos, buscaConsentimentos);
                                            }}
                                            className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#2a261f] border border-white/10 text-gray-300 hover:text-white hover:border-primary/50 text-sm font-medium transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                                            Atualizar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Scrollable Content - Cadastros */}
                        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#332d25 #1e1a14' }}>
                            <div className="max-w-5xl mx-auto w-full pb-20">
                                {carregandoConsentimentos ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    </div>
                                ) : consentimentos.length === 0 ? (
                                    <div className="bg-[#2a261f] rounded-xl border border-white/5 p-12 text-center">
                                        <span className="material-symbols-outlined text-gray-600 text-5xl mb-4">person_off</span>
                                        <p className="text-gray-400">Nenhum cadastro recebido ainda.</p>
                                        <p className="text-gray-600 text-sm mt-2">Os cadastros aparecerão aqui quando as pessoas preencherem o formulário.</p>
                                    </div>
                                ) : (
                                    <div className="bg-[#2a261f] rounded-xl border border-white/5 overflow-hidden">
                                        {/* Table Header */}
                                        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#1e1a14] border-b border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <div className="col-span-3">Nome</div>
                                            <div className="col-span-2">CPF</div>
                                            <div className="col-span-3">Email</div>
                                            <div className="col-span-2">Campanha</div>
                                            <div className="col-span-2">Data</div>
                                        </div>

                                        {/* Table Body */}
                                        <div className="divide-y divide-white/5">
                                            {consentimentos.map((c) => (
                                                <div
                                                    key={c.id}
                                                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="col-span-3 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                            <span className="text-primary text-sm font-bold">
                                                                {c.nome_fornecido?.charAt(0)?.toUpperCase() || "?"}
                                                            </span>
                                                        </div>
                                                        <span className="text-white font-medium truncate">
                                                            {c.nome_fornecido || "—"}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2 flex items-center">
                                                        <span className="text-gray-400 font-mono text-sm">
                                                            {mascararCPF(c.cpf)}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-3 flex items-center">
                                                        <span className="text-gray-400 text-sm truncate">
                                                            {c.email_fornecido || "—"}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2 flex items-center">
                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                                            {c.source_campaign || "direct"}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2 flex items-center">
                                                        <span className="text-gray-500 text-sm">
                                                            {new Date(c.created_at).toLocaleDateString("pt-BR", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
