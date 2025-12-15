
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";

// Tipo para o CSV
interface CSVRow {
    NUMERO_PROCESSO: string;
    REU: string;
    DOC_REU?: string;
    EMAIL?: string;
    TELEFONE?: string;
    // ... outros campos opcionais
    [key: string]: any;
}

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
    telefone?: string;
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
    "legal": { nome: "Documentos Legais", icone: "gavel" },
};

export default function AdminConteudosPage() {
    const router = useRouter();


    // ============================================
    // ESTADOS
    // ============================================
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

    // Estados - Filtros Cadastros
    const [filtroDataInicioCad, setFiltroDataInicioCad] = useState('');
    const [filtroDataFimCad, setFiltroDataFimCad] = useState('');
    const [filtroCampaignCad, setFiltroCampaignCad] = useState('');

    // Estado para controle do menu mobile
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Estados - Casos
    const [casos, setCasos] = useState<Caso[]>([]);
    const [carregandoCasos, setCarregandoCasos] = useState(false);
    const [totalCasos, setTotalCasos] = useState(0);
    const [buscaCasos, setBuscaCasos] = useState('');
    const [casoSelecionado, setCasoSelecionado] = useState<Caso | null>(null);
    const [paginaCasos, setPaginaCasos] = useState(0);

    // Estados - Filtros Casos
    const [filtroAdvogado, setFiltroAdvogado] = useState<'todos' | 'com_advogado' | 'sem_advogado'>('todos');
    const [filtroConsentimento, setFiltroConsentimento] = useState<'todos' | 'com_consentimento' | 'sem_consentimento'>('todos');
    const [filtroTipoPessoa, setFiltroTipoPessoa] = useState<'todos' | 'pessoa_fisica' | 'pessoa_juridica'>('todos');
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');

    // Estados de seleção (Bulk Actions)
    const [casosSelecionados, setCasosSelecionados] = useState<string[]>([]);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [deletandoLote, setDeletandoLote] = useState(false);

    // Estados de Importação CSV
    const [showImportModal, setShowImportModal] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importStats, setImportStats] = useState<{ inserted: number, updated: number, errors: string[] } | null>(null);


    // ============================================
    // EFEITOS
    // ============================================

    // Carregar dados iniciais
    useEffect(() => {
        carregarConteudos();
    }, []);

    // Efeito para sincronizar "Select All" com a página atual
    useEffect(() => {
        if (casos.length > 0 && casosSelecionados.length > 0) {
            const allInPageSelected = casos.every(c => casosSelecionados.includes(c.id));
            setIsAllSelected(allInPageSelected);
        } else {
            setIsAllSelected(false);
        }
    }, [casos, casosSelecionados]);

    // Função: Toggle Seleção de Único Caso
    const toggleSelectCaso = (id: string, e: React.SyntheticEvent) => {
        e.stopPropagation(); // Evita abrir o detalhe do caso
        setCasosSelecionados(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Função: Toggle Selecionar Todos da Página
    const toggleSelectAll = () => {
        if (isAllSelected) {
            // Desmarcar todos da página atual
            const idsPagina = casos.map(c => c.id);
            setCasosSelecionados(prev => prev.filter(id => !idsPagina.includes(id)));
        } else {
            // Marcar todos da página atual
            const idsPagina = casos.map(c => c.id);
            const novos = idsPagina.filter(id => !casosSelecionados.includes(id));
            setCasosSelecionados(prev => [...prev, ...novos]);
        }
    };

    // Função: Deletar em Lote
    const handleBulkDelete = async () => {
        if (!confirm(`Tem certeza que deseja deletar ${casosSelecionados.length} casos ? Essa ação não pode ser desfeita.`)) return;

        setDeletandoLote(true);
        try {
            const res = await fetch('/api/admin/casos/batch', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: casosSelecionados })
            });

            if (!res.ok) throw new Error("Erro ao deletar");

            alert("Casos deletados com sucesso!");
            setCasosSelecionados([]);
            carregarCasos(paginaCasos, buscaCasos); // Recarrega a lista
        } catch (error) {
            console.error(error);
            alert("Erro ao deletar casos.");
        } finally {
            setDeletandoLote(false);
        }
    };

    // Função: Processar Upload CSV
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setImportStats(null);

        Papa.parse<CSVRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data;
                console.log("Parsed CSV:", rows);

                try {
                    const res = await fetch('/api/admin/casos/batch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ casos: rows })
                    });

                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Erro na importação");

                    setImportStats(data.results);
                    carregarCasos(0, ""); // Reset para primeira página
                } catch (error) {
                    console.error("Import Error:", error);
                    alert("Erro ao processar importação: " + (error as any).message);
                } finally {
                    setImporting(false);
                    // Limpar input
                    e.target.value = "";
                }
            },
            error: (error) => {
                console.error("CSV Parse Error:", error);
                alert("Erro ao ler arquivo CSV.");
                setImporting(false);
            }
        });
    };

    // Função: Baixar Modelo CSV
    const downloadTemplate = () => {
        const headers = ["NUMERO_PROCESSO", "REU", "DOC_REU", "EMAIL", "TELEFONE", "DATA_DISTRIBUICAO", "VARA", "COMARCA", "VALOR_CAUSA"];
        const csvContent = headers.join(",") + "\n";
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "modelo_importacao_casos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // This useEffect was already present, moved here to be after new effects/functions
    useEffect(() => {
        // Assuming verificarSessao is defined elsewhere or removed if not needed.
        // If it's a function that needs to be called on component mount, it should be here.
        // For now, keeping it as a placeholder comment.
        // verificarSessao();
    }, []);

    // Carregar dados ao trocar de aba
    useEffect(() => {
        if (activeTab === "cadastros") {
            carregarConsentimentos();
        } else if (activeTab === "casos") {
            carregarCasos();
        }
    }, [activeTab]);

    // Recarregar conteúdos quando filtro de página muda
    useEffect(() => {
        if (activeTab === "textos") {
            carregarConteudos();
        }
    }, [filtroPagina]);

    // Recarregar casos quando filtros mudam
    useEffect(() => {
        if (activeTab === "casos") {
            setPaginaCasos(0);
            carregarCasos(0, buscaCasos);
        }
    }, [filtroAdvogado, filtroConsentimento, filtroTipoPessoa, filtroDataInicio, filtroDataFim]);

    // Recarregar consentimentos quando filtros mudam
    useEffect(() => {
        if (activeTab === "cadastros") {
            setPaginaConsentimentos(0);
            carregarConsentimentos(0, buscaConsentimentos);
        }
    }, [filtroDataInicioCad, filtroDataFimCad, filtroCampaignCad]);

    // ============================================
    // FUNÇÕES AUXILIARES
    // ============================================

    // CONTEÚDOS (TEXTOS)
    const carregarConteudos = async () => {
        setCarregando(true);
        try {
            const url = filtroPagina !== "all"
                ? `/ api / admin / conteudos ? pagina = ${encodeURIComponent(filtroPagina)} `
                : "/api/admin/conteudos";

            const response = await fetch(url, {
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
        setSalvando(true);
        try {
            const updates = Object.entries(alteracoesPendentes).map(async ([chave, texto]) => {
                // Encontra o ID original se necessário ou manda a chave
                const response = await fetch("/api/admin/conteudos", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ chave, texto })
                });
                if (!response.ok) throw new Error(`Falha ao salvar ${chave} `);
            });

            await Promise.all(updates);

            // Recarrega tudo
            await carregarConteudos();
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
    const carregarConsentimentos = async (page = 0, search = '') => {
        setCarregandoConsentimentos(true);
        try {
            const params = new URLSearchParams();
            params.append("page", String(page + 1)); // API usa 1-indexed
            params.append("limit", "50");
            if (search) params.append("q", search);

            // Filtros Cadastros
            if (filtroDataInicioCad) params.append("dataInicio", filtroDataInicioCad);
            if (filtroDataFimCad) params.append("dataFim", filtroDataFimCad);
            if (filtroCampaignCad) params.append("campaign", filtroCampaignCad);

            const response = await fetch(`/ api / admin / consentimentos ? ${params.toString()} `, {
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

    const mascararCPF = (valor: string) => {
        if (!valor) return "—";
        const limpo = valor.replace(/\D/g, "");
        if (limpo.length === 11) {
            return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4");
        }
        if (limpo.length === 14) {
            return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.***.***/$4-$5");
        }
        return valor;
    };

    // CASOS
    const carregarCasos = async (page = 0, search = '') => {
        setCarregandoCasos(true);
        try {
            const params = new URLSearchParams();
            params.append("page", String(page));
            params.append("limit", "50");
            if (search) params.append("q", search);

            // Filtros
            if (filtroAdvogado !== 'todos') params.append("advogado", filtroAdvogado);
            if (filtroConsentimento !== 'todos') params.append("consentimento", filtroConsentimento);
            if (filtroTipoPessoa !== 'todos') params.append("tipo_pessoa", filtroTipoPessoa);
            if (filtroDataInicio) params.append("data_inicio", filtroDataInicio);
            if (filtroDataFim) params.append("data_fim", filtroDataFim);

            const response = await fetch(`/ api / admin / casos ? ${params.toString()} `, {
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
        setPaginaCasos(0); // Reset to first page on search
        carregarCasos(0, buscaCasos);
    };

    const handleBuscaConsentimentos = (e: React.FormEvent) => {
        e.preventDefault();
        setPaginaConsentimentos(0);
        carregarConsentimentos(0, buscaConsentimentos);
    };

    // Funções de paginação para Casos
    const totalPaginasCasos = Math.ceil(totalCasos / 50);
    const irParaPaginaCasos = (page: number) => {
        if (page >= 0 && page < totalPaginasCasos) {
            setPaginaCasos(page);
            setCasoSelecionado(null);
            carregarCasos(page, buscaCasos);
        }
    };

    // Funções de paginação para Consentimentos
    const totalPaginasConsentimentos = Math.ceil(totalConsentimentos / 50);
    const irParaPaginaConsentimentos = (page: number) => {
        if (page >= 0 && page < totalPaginasConsentimentos) {
            setPaginaConsentimentos(page);
            setConsentimentoSelecionado(null);
            carregarConsentimentos(page, buscaConsentimentos);
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


    // ============================================
    // RENDER: PAINEL ADMIN MAIN
    // ============================================
    return (
        <div className="flex h-screen w-full bg-[#1e1a14] text-white overflow-hidden relative">

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset - y - 0 left - 0 z - 50 w - 72 bg - [#2a261f] border - r border - white / 5 flex flex - col justify - between shrink - 0 h - full transition - transform duration - 300 ease -in -out shadow - 2xl md: shadow - none
md:relative md: translate - x - 0
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
`}>
                <div className="flex flex-col gap-6 p-6">
                    {/* Brand */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md border border-white/10">
                                <span className="text-black font-bold text-lg">W</span>
                            </div>
                            <div>
                                <h1 className="text-white text-base font-semibold leading-tight tracking-tight">
                                    Wagner Chaves
                                </h1>
                                <p className="text-primary text-xs font-medium">Painel Admin</p>
                            </div>
                        </div>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2">
                        <button
                            onClick={() => { setActiveTab("textos"); setMobileMenuOpen(false); }}
                            className={`flex items - center gap - 3 h - 12 px - 4 rounded - xl text - sm font - medium transition - all ${activeTab === "textos"
                                ? "bg-primary text-black shadow-lg shadow-primary/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                } `}
                        >
                            <span className="material-symbols-outlined">edit_document</span>
                            Gerenciar Textos
                        </button>
                        <button
                            onClick={() => { setActiveTab("casos"); setMobileMenuOpen(false); }}
                            className={`flex items - center gap - 3 h - 12 px - 4 rounded - xl text - sm font - medium transition - all ${activeTab === "casos"
                                ? "bg-primary text-black shadow-lg shadow-primary/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                } `}
                        >
                            <span className="material-symbols-outlined">folder_managed</span>
                            Gestão de Casos
                        </button>
                        <button
                            onClick={() => { setActiveTab("cadastros"); setMobileMenuOpen(false); }}
                            className={`flex items - center gap - 3 h - 12 px - 4 rounded - xl text - sm font - medium transition - all ${activeTab === "cadastros"
                                ? "bg-primary text-black shadow-lg shadow-primary/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                } `}
                        >
                            <span className="material-symbols-outlined">group</span>
                            Cadastros Recebidos
                        </button>
                    </nav>
                </div>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={async () => {
                            await fetch("/api/admin/logout", { method: "POST" });
                            router.push("/admin/login");
                        }}
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
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setMobileMenuOpen(true)}
                                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-[#2a261f] border border-white/10 text-gray-400 hover:text-white"
                                        >
                                            <span className="material-symbols-outlined">menu</span>
                                        </button>
                                        <div className="flex flex-col gap-1">
                                            <h2 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                                                Gestão de Casos
                                            </h2>
                                            <p className="text-gray-400 text-sm hidden md:block">
                                                Base de processos e status de consentimento dos clientes.
                                            </p>
                                        </div>
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

                                        {/* Botão Importar CSV */}
                                        <button
                                            onClick={() => setShowImportModal(true)}
                                            className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 text-sm font-medium transition-colors"
                                            title="Importar Casos via CSV"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">upload_file</span>
                                            <span className="hidden md:inline">Importar</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                carregarCasos(paginaCasos, buscaCasos);
                                            }}
                                            className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#2a261f] border border-white/10 text-gray-300 hover:text-white hover:border-primary/50 text-sm font-medium transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                                            Atualizar
                                        </button>
                                    </div>
                                </div>

                                {/* Toolbar de Filtros */}
                                <div className="mt-6 border-t border-white/5 pt-6">
                                    <div className="grid grid-cols-1 md:flex md:flex-wrap items-center gap-4 bg-[#2a261f] border border-white/5 p-3 rounded-xl">
                                        <div className="flex items-center gap-2 md:w-auto w-full justify-center md:justify-start pb-2 md:pb-0 border-b md:border-b-0 border-white/5">
                                            <span className="material-symbols-outlined text-gray-400 text-[20px]">filter_alt</span>
                                            <span className="text-gray-400 text-sm font-medium">Filtrar por:</span>
                                        </div>

                                        {/* Select Advogado */}
                                        <select
                                            value={filtroAdvogado}
                                            onChange={(e) => setFiltroAdvogado(e.target.value as any)}
                                            className="w-full md:w-auto bg-[#1e1a14] border border-white/10 rounded-lg h-9 px-3 text-sm text-white focus:border-primary focus:outline-none min-w-[160px]"
                                        >
                                            <option value="todos">Todos os Status</option>
                                            <option value="com_advogado">Com Advogado</option>
                                            <option value="sem_advogado">Sem Advogado</option>
                                        </select>

                                        {/* Select Consentimento (NOVO) */}
                                        <select
                                            value={filtroConsentimento}
                                            onChange={(e) => setFiltroConsentimento(e.target.value as any)}
                                            className="w-full md:w-auto bg-[#1e1a14] border border-white/10 rounded-lg h-9 px-3 text-sm text-white focus:border-primary focus:outline-none min-w-[170px]"
                                        >
                                            <option value="todos">Todos os Consentimentos</option>
                                            <option value="com_consentimento">Com Consentimento</option>
                                            <option value="sem_consentimento">Sem Consentimento</option>
                                        </select>

                                        {/* Select Tipo Pessoa (NOVO) */}
                                        <select
                                            value={filtroTipoPessoa}
                                            onChange={(e) => setFiltroTipoPessoa(e.target.value as any)}
                                            className="w-full md:w-auto bg-[#1e1a14] border border-white/10 rounded-lg h-9 px-3 text-sm text-white focus:border-primary focus:outline-none min-w-[170px]"
                                        >
                                            <option value="todos">Todos os Tipos de Pessoa</option>
                                            <option value="pessoa_fisica">Pessoa Física</option>
                                            <option value="pessoa_juridica">Pessoa Jurídica</option>
                                        </select>

                                        <div className="h-6 w-px bg-white/10 mx-2 hidden md:block"></div>

                                        {/* Data Distribuição */}
                                        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider hidden md:inline">Distribuição:</span>
                                            <div className="flex items-center gap-2 w-full md:w-auto">
                                                <input
                                                    type="date"
                                                    value={filtroDataInicio}
                                                    onChange={(e) => setFiltroDataInicio(e.target.value)}
                                                    className="w-full md:w-32 bg-[#1e1a14] border border-white/10 rounded-lg h-9 px-2 text-xs text-center text-white focus:border-primary focus:outline-none"
                                                />
                                                <span className="text-gray-600">—</span>
                                                <input
                                                    type="date"
                                                    value={filtroDataFim}
                                                    onChange={(e) => setFiltroDataFim(e.target.value)}
                                                    className="w-full md:w-32 bg-[#1e1a14] border border-white/10 rounded-lg h-9 px-2 text-xs text-center text-white focus:border-primary focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        {(filtroAdvogado !== 'todos' || filtroConsentimento !== 'todos' || filtroTipoPessoa !== 'todos' || filtroDataInicio || filtroDataFim) && (
                                            <button
                                                onClick={() => {
                                                    setFiltroAdvogado('todos');
                                                    setFiltroConsentimento('todos');
                                                    setFiltroTipoPessoa('todos');
                                                    setFiltroDataInicio('');
                                                    setFiltroDataFim('');
                                                }}
                                                className="ml-auto text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                                Limpar Filtros
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto md:overflow-hidden p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#332d25 #1e1a14' }}>
                            <div className="max-w-6xl mx-auto w-full pb-20 md:pb-0 md:h-full md:flex md:flex-col">
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
                                    <div className="flex gap-6 md:h-full">
                                        {/* Lista de casos */}
                                        <div className={`transition - all duration - 300 md: h - full md:flex md: flex - col ${casoSelecionado ? 'hidden md:block md:w-[55%]' : 'w-full'} `}>
                                            <div className="bg-[#2a261f] rounded-xl border border-white/5 overflow-hidden md:h-full md:flex md:flex-col">
                                                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#1e1a14] border-b border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider items-center">
                                                    <div className="col-span-1 flex justify-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isAllSelected}
                                                            onChange={toggleSelectAll}
                                                            className="w-4 h-4 rounded border-gray-600 bg-[#2a261f] text-primary focus:ring-primary/50"
                                                        />
                                                    </div>
                                                    <div className="col-span-1 text-center">Status</div>
                                                    <div className="col-span-5">Réu / Nome</div>
                                                    <div className="col-span-3">Email</div>
                                                    <div className="col-span-3 text-right">Processo</div>
                                                </div>

                                                <div className="divide-y divide-white/5 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                                    {casos.map((caso) => {
                                                        const temConsentimento = !!caso.consentimento_id;
                                                        const isSelected = casoSelecionado?.id === caso.id;

                                                        return (
                                                            <div
                                                                key={caso.id}
                                                                onClick={() => setCasoSelecionado(isSelected ? null : caso)}
                                                                className={`flex flex - col md:grid md: grid - cols - 12 gap - 3 md: gap - 4 px - 6 py - 4 cursor - pointer transition - all md: items - center border - b border - white / 5 md: border - b - 0 ${isSelected ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-white/5'} `}
                                                            >
                                                                {/* Checkbox (Mobile & Desktop) */}
                                                                <div className="md:col-span-1 flex md:justify-center" onClick={(e) => e.stopPropagation()}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={casosSelecionados.includes(caso.id)}
                                                                        onChange={(e) => toggleSelectCaso(caso.id, e)} // Corrigido para passar o evento
                                                                        className="w-4 h-4 rounded border-gray-600 bg-[#2a261f] text-primary focus:ring-primary/50"
                                                                    />
                                                                </div>
                                                                {/* Mobile Header: Icon + Name */}
                                                                <div className="flex items-center gap-3 md:contents">
                                                                    <div className="flex-shrink-0 md:col-span-1 md:flex md:justify-center">
                                                                        {temConsentimento ? (
                                                                            <span className="material-symbols-outlined text-green-500" title="Consentimento Confirmado">check_circle</span>
                                                                        ) : (
                                                                            <span className="material-symbols-outlined text-gray-600" title="Aguardando Cadastro">pending</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 md:col-span-5 min-w-0">
                                                                        <div className="text-white font-medium truncate" title={caso.REU}>{caso.REU}</div>
                                                                        {/* Mobile Only Extra Info */}
                                                                        <div className="md:hidden text-xs text-primary font-mono mt-0.5">{caso.NUMERO_PROCESSO}</div>
                                                                    </div>
                                                                </div>

                                                                {/* Desktop Columns / Mobile Bottom Row */}
                                                                <div className="md:col-span-3 pl-9 md:pl-0">
                                                                    <div className="text-gray-400 text-sm truncate" title={caso.EMAIL}>{caso.EMAIL || (
                                                                        <span className="text-gray-600 italic text-xs">Sem email</span>
                                                                    )}</div>
                                                                </div>
                                                                <div className="hidden md:block md:col-span-3 text-right">
                                                                    <div className="text-primary font-mono text-sm truncate" title={caso.NUMERO_PROCESSO}>{caso.NUMERO_PROCESSO}</div>
                                                                    <div className="flex items-center justify-end gap-3 mt-1">
                                                                        {caso.DATA_DISTRIBUICAO && (
                                                                            <span className="text-xs text-gray-500 flex items-center gap-1" title="Data de Distribuição">
                                                                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                                                {new Date(caso.DATA_DISTRIBUICAO).toLocaleDateString('pt-BR')}
                                                                            </span>
                                                                        )}
                                                                        {caso.ADVOGADO && (
                                                                            <span className="text-xs text-amber-500 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20" title={`Advogado: ${caso.ADVOGADO} `}>
                                                                                <span className="material-symbols-outlined text-[14px]">gavel</span>
                                                                                Adv.
                                                                            </span>
                                                                        )}
                                                                    </div>
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
                                        <div className={`transition - all duration - 300 md: h - full md:flex md: flex - col ${casoSelecionado ? 'fixed inset-0 z-[60] bg-[#1e1a14] md:static md:w-[45%] md:bg-transparent md:z-auto opacity-100 flex flex-col' : 'w-0 opacity-0 hidden'} `}>
                                            {casoSelecionado && (
                                                <div className="bg-[#2a261f] border-b border-white/5 md:rounded-xl md:border md:border-white/5 h-full md:h-full flex flex-col">
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
                                                                                {casoSelecionado.NUMERO && `, ${casoSelecionado.NUMERO} `}
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
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setMobileMenuOpen(true)}
                                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-[#2a261f] border border-white/10 text-gray-400 hover:text-white"
                                        >
                                            <span className="material-symbols-outlined">menu</span>
                                        </button>
                                        <div className="flex flex-col gap-1">
                                            <h2 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                                                Gerenciar Textos
                                            </h2>
                                            <p className="text-gray-400 text-sm hidden md:block">
                                                Edite os textos do site em tempo real. As alterações aparecem instantaneamente após salvar.
                                            </p>
                                        </div>
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
                                <div className="flex gap-2 mt-6 overflow-x-auto pb-2 w-full touch-pan-x snap-x">
                                    <button
                                        onClick={() => setFiltroPagina("all")}
                                        className={`px - 4 py - 2 rounded - full text - xs font - bold uppercase tracking - wider whitespace - nowrap transition - colors ${filtroPagina === "all"
                                            ? "bg-white text-black"
                                            : "bg-[#2a261f] text-gray-400 hover:text-white hover:bg-[#332d25]"
                                            } `}
                                    >
                                        Todos
                                    </button>
                                    {Object.keys(PAGINAS_CONFIG).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => setFiltroPagina(key)}
                                            className={`px - 4 py - 2 rounded - full text - xs font - bold uppercase tracking - wider whitespace - nowrap transition - colors ${filtroPagina === key
                                                ? "bg-white text-black"
                                                : "bg-[#2a261f] text-gray-400 hover:text-white hover:bg-[#332d25]"
                                                } `}
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
                                    <>
                                        {/* Iteração de Páginas */}
                                        {Object.entries(PAGINAS_CONFIG).map(([pageKey, config]) => {
                                            const conteudosDaPagina = conteudosPorPagina[pageKey];
                                            if (!conteudosDaPagina || conteudosDaPagina.length === 0) return null;

                                            // Se filtro estiver ativo e não for a página atual ou 'all', pula
                                            if (filtroPagina !== "all" && filtroPagina !== pageKey) return null;

                                            return (
                                                <div key={pageKey} className="bg-[#2a261f] rounded-xl border border-white/5 overflow-hidden mb-6">
                                                    <div className="bg-[#1e1a14] px-6 py-4 border-b border-white/5 flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary">{config.icone}</span>
                                                        <h3 className="text-lg font-bold text-white">{config.nome}</h3>
                                                        <span className="ml-auto text-xs text-gray-500 bg-[#1e1a14] px-2 py-1 rounded">
                                                            {conteudosDaPagina.length} {conteudosDaPagina.length === 1 ? "item" : "itens"}
                                                        </span>
                                                    </div>

                                                    <div className="p-6 grid gap-6">
                                                        {conteudosDaPagina.map((conteudo) => {
                                                            const valorAtual = getTextoAtual(conteudo);
                                                            const original = conteudo.texto;
                                                            const modificado = valorAtual !== original;
                                                            const isLargeText = pageKey === 'legal' || conteudo.tipo === "paragrafo" || valorAtual.length > 80;

                                                            return (
                                                                <div key={conteudo.id} className="grid md:grid-cols-12 gap-4 items-start">
                                                                    <div className="md:col-span-4">
                                                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                                                            {conteudo.descricao || conteudo.chave}
                                                                        </label>
                                                                        <code className="text-xs text-gray-600 bg-black/20 px-2 py-1 rounded">
                                                                            {conteudo.chave}
                                                                        </code>
                                                                        {pageKey === 'legal' && (
                                                                            <div className="mt-2 text-xs text-gray-500 bg-black/10 p-2 rounded border border-white/5">
                                                                                <p className="font-bold mb-1">Dicas de Formatação:</p>
                                                                                <ul className="list-disc list-inside space-y-0.5">
                                                                                    <li>## Título da Seção</li>
                                                                                    <li>**Texto Negrito**</li>
                                                                                    <li>- Item de lista</li>
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="md:col-span-8">
                                                                        {isLargeText ? (
                                                                            <textarea
                                                                                value={valorAtual}
                                                                                onChange={(e) => handleTextoChange(conteudo.chave, e.target.value)}
                                                                                rows={pageKey === 'legal' ? 20 : 6}
                                                                                className={`w - full bg - [#1e1a14] border rounded - lg p - 3 text - sm text - white placeholder - gray - 600 focus: border - primary focus: outline - none transition - all font - mono leading - relaxed ${modificado ? "border-primary/50 bg-primary/5" : "border-white/10"} `}
                                                                            />
                                                                        ) : (
                                                                            <input
                                                                                type="text"
                                                                                value={valorAtual}
                                                                                onChange={(e) => handleTextoChange(conteudo.chave, e.target.value)}
                                                                                className={`w - full bg - [#1e1a14] border rounded - lg h - 10 px - 4 text - sm text - white placeholder - gray - 600 focus: border - primary focus: outline - none transition - all ${modificado ? "border-primary/50 bg-primary/5" : "border-white/10"} `}
                                                                            />
                                                                        )}

                                                                        {modificado && (
                                                                            <div className="flex items-center justify-between mt-2">
                                                                                <span className="text-xs text-primary">Alteração pendente</span>
                                                                                <button
                                                                                    onClick={() => handleTextoChange(conteudo.chave, original)}
                                                                                    className="text-xs text-gray-500 hover:text-white underline"
                                                                                >
                                                                                    Desfazer
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
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
                            <div className="max-w-6xl mx-auto px-6 py-6 w-full">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setMobileMenuOpen(true)}
                                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-[#2a261f] border border-white/10 text-gray-400 hover:text-white"
                                        >
                                            <span className="material-symbols-outlined">menu</span>
                                        </button>
                                        <div className="flex flex-col gap-1">
                                            <h2 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                                                Cadastros Recebidos
                                            </h2>
                                            <p className="text-gray-400 text-sm hidden md:block">
                                                Pessoas que confirmaram interesse e consentiram com os termos.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Toolbar de Filtros */}
                                    <div className="flex items-center gap-2 flex-wrap">

                                        {/* Filtro Campanha */}
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-gray-500 text-[18px]">campaign</span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Origem..."
                                                value={filtroCampaignCad}
                                                onChange={(e) => setFiltroCampaignCad(e.target.value)}
                                                className="bg-[#1e1a14] border border-white/10 rounded-lg h-9 pl-8 pr-3 text-sm text-white placeholder-gray-600 focus:border-primary focus:outline-none w-28 transition-all focus:w-40"
                                            />
                                        </div>

                                        <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

                                        {/* Filtro Data */}
                                        <div className="flex items-center gap-1 bg-[#2a261f] border border-white/10 rounded-lg p-0.5">
                                            <input
                                                type="date"
                                                value={filtroDataInicioCad}
                                                onChange={(e) => setFiltroDataInicioCad(e.target.value)}
                                                className="bg-transparent text-white text-xs px-2 h-8 focus:outline-none w-28"
                                            />
                                            <span className="text-gray-600">—</span>
                                            <input
                                                type="date"
                                                value={filtroDataFimCad}
                                                onChange={(e) => setFiltroDataFimCad(e.target.value)}
                                                className="bg-transparent text-white text-xs px-2 h-8 focus:outline-none w-28"
                                            />
                                        </div>

                                        <button
                                            onClick={() => {
                                                carregarConsentimentos(paginaConsentimentos, buscaConsentimentos);
                                            }}
                                            className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-black transition-colors ml-2"
                                            title="Atualizar Lista"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">refresh</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Scrollable Content - Cadastros */}
                        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#332d25 #1e1a14' }}>
                            <div className="max-w-6xl mx-auto w-full pb-20">
                                {carregandoConsentimentos ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    </div>
                                ) : consentimentos.length === 0 ? (
                                    <div className="bg-[#2a261f] rounded-xl border border-white/5 p-12 text-center">
                                        <span className="material-symbols-outlined text-gray-600 text-5xl mb-4">person_off</span>
                                        <p className="text-gray-400">Nenhum cadastro recebido ainda.</p>
                                        <p className="text-gray-600 text-sm mt-2">Tente limpar os filtros ou aguarde novos cadastros.</p>
                                    </div>
                                ) : (
                                    <div className="bg-[#2a261f] rounded-xl border border-white/5 overflow-hidden">
                                        {/* Table Header */}
                                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#1e1a14] border-b border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <div className="col-span-3">Nome</div>
                                            <div className="col-span-2">CPF/CNPJ</div>
                                            <div className="col-span-3">Contato</div>
                                            <div className="col-span-1">Origem</div>
                                            <div className="col-span-1">Data</div>
                                            <div className="col-span-2 text-right">Ações</div>
                                        </div>

                                        {/* Table Body */}
                                        <div className="divide-y divide-white/5">
                                            {consentimentos.map((c) => (
                                                <div
                                                    key={c.id}
                                                    className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 md:border-b-0 items-center"
                                                >
                                                    {/* Nome */}
                                                    <div className="md:col-span-3 flex items-center gap-3 w-full">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                            <span className="text-primary text-sm font-bold">
                                                                {c.nome_fornecido?.charAt(0)?.toUpperCase() || "?"}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-white font-medium truncate">
                                                                {c.nome_fornecido || "—"}
                                                            </span>
                                                            {/* Mobile Subtitle */}
                                                            <div className="md:hidden flex items-center gap-2 mt-0.5">
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* CPF */}
                                                    <div className="md:col-span-2 w-full flex items-center justify-between md:justify-start">
                                                        <span className="md:hidden text-xs text-gray-500 uppercase font-bold">Documento:</span>
                                                        <span className="text-gray-400 font-mono text-sm bg-black/20 px-1.5 py-0.5 rounded">
                                                            {mascararCPF(c.cpf)}
                                                        </span>
                                                    </div>

                                                    {/* Contato (Email + Telefone) */}
                                                    <div className="md:col-span-3 w-full">
                                                        <div className="flex flex-col gap-1">
                                                            {c.email_fornecido && (
                                                                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigator.clipboard.writeText(c.email_fornecido)} title="Clique para copiar">
                                                                    <span className="material-symbols-outlined text-[14px] text-gray-500 group-hover:text-primary">mail</span>
                                                                    <span className="text-gray-400 text-sm truncate group-hover:text-white transition-colors">{c.email_fornecido}</span>
                                                                </div>
                                                            )}
                                                            {c.telefone && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-[14px] text-gray-500">call</span>
                                                                    <span className="text-gray-400 text-sm">{c.telefone}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Origem */}
                                                    <div className="md:col-span-1 w-full flex items-center justify-between md:justify-start">
                                                        <span className="md:hidden text-xs text-gray-500 uppercase font-bold">Origem:</span>
                                                        <span className="text-xs font-semibold px-2 py-1 rounded bg-[#1e1a14] border border-white/10 text-gray-300">
                                                            {c.source_campaign || "orgânico"}
                                                        </span>
                                                    </div>

                                                    {/* Data */}
                                                    <div className="hidden md:flex md:col-span-1 items-center">
                                                        <span className="text-gray-500 text-sm">
                                                            {new Date(c.created_at).toLocaleDateString("pt-BR", {
                                                                day: "2-digit",
                                                                month: "2-digit"
                                                            })}
                                                        </span>
                                                    </div>

                                                    {/* Ações */}
                                                    <div className="md:col-span-2 w-full flex items-center justify-end gap-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t border-white/5 md:border-0 h-full">

                                                        {c.telefone ? (
                                                            <a
                                                                href={`https://wa.me/55${c.telefone.replace(/\D/g, '')}?text=Olá ${c.nome_fornecido}, tudo bem?`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex-1 md:flex-none h-8 px-3 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all"
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">chat</span>
                                                                WhatsApp
                                                            </a >
                                                        ) : (
                                                            <button disabled className="flex-1 md:flex-none h-8 px-3 bg-white/5 text-gray-600 rounded-lg flex items-center justify-center gap-2 text-xs cursor-not-allowed">
                                                                <span className="material-symbols-outlined text-[16px]">chat_off</span>
                                                                WhatsApp
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`${c.nome_fornecido}\n${c.email_fornecido}\n${c.cpf}`);
                                                                alert("Dados copiados!");
                                                            }}
                                                            className="w-8 h-8 rounded-lg bg-[#1e1a14] border border-white/10 hover:border-primary/50 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                                                            title="Copiar Dados"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                                        </button>
                                                    </div >
                                                </div >
                                            ))}
                                        </div >
                                        {/* Paginação */}
                                        < div className="px-6 py-4 border-t border-white/5 bg-[#1e1a14]/50 flex items-center justify-between" >
                                            <div className="text-xs text-gray-500">
                                                Mostrando {consentimentos.length} de {totalConsentimentos} resultados
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => irParaPaginaConsentimentos(paginaConsentimentos - 1)}
                                                    disabled={paginaConsentimentos === 0}
                                                    className="h-8 px-3 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    ← Anterior
                                                </button>
                                                <span className="text-xs text-gray-400 px-2">
                                                    Página {paginaConsentimentos + 1}
                                                </span>
                                                <button
                                                    onClick={() => irParaPaginaConsentimentos(paginaConsentimentos + 1)}
                                                    disabled={consentimentos.length < 50} // Simple check
                                                    className="h-8 px-3 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    Próxima →
                                                </button>
                                            </div>
                                        </div >
                                    </div >
                                )}
                            </div >
                        </div >
                    </>
                )}
            </main >

            {/* Custom Scrollbar Styles */}
            < style jsx global > {`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style >
            {/* Floating Action Bar (Bulk Delete) */}
            {
                casosSelecionados.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1e1a14] border border-white/10 rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 animate-slide-up">
                        <span className="text-white font-medium text-sm">{casosSelecionados.length} selecionado(s)</span>
                        <div className="h-4 w-px bg-white/10"></div>
                        <button
                            onClick={handleBulkDelete}
                            disabled={deletandoLote}
                            className="flex items-center gap-2 text-red-400 hover:text-red-300 font-bold text-sm transition-colors disabled:opacity-50"
                        >
                            {deletandoLote ? (
                                <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            )}
                            Deletar
                        </button>
                    </div>
                )
            }

            {/* Modal Importação CSV */}
            {
                showImportModal && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#1e1a14] rounded-2xl border border-white/5 w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500">upload_file</span>
                                    Importar CSV
                                </h3>
                                <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {!importStats ? (
                                    <>
                                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                                            <h4 className="text-primary font-bold text-sm mb-2 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">info</span>
                                                Instruções Importantes
                                            </h4>
                                            <ul className="text-sm text-gray-400 space-y-1 ml-6 list-disc">
                                                <li>Use o modelo padrão para evitar erros.</li>
                                                <li>Processos com o mesmo <strong>Número + Réu</strong> serão atualizados.</li>
                                                <li>Colunas vazias serão ignoradas (mantidas como opcionais).</li>
                                            </ul>
                                            <button
                                                onClick={downloadTemplate}
                                                className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">download</span>
                                                Baixar Modelo CSV
                                            </button>
                                        </div>

                                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileUpload}
                                                disabled={importing}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                            {importing ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                    <p className="text-gray-400">Processando arquivo...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-gray-500 text-4xl mb-2">cloud_upload</span>
                                                    <p className="text-white font-medium">Clique ou arraste seu arquivo CSV</p>
                                                    <p className="text-xs text-gray-500 mt-1">Apenas arquivos .csv</p>
                                                </>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center">
                                                <div className="text-2xl font-bold text-emerald-500">{importStats.inserted}</div>
                                                <div className="text-xs text-emerald-400 uppercase font-bold tracking-wider">Novos</div>
                                            </div>
                                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-center">
                                                <div className="text-2xl font-bold text-blue-500">{importStats.updated}</div>
                                                <div className="text-xs text-blue-400 uppercase font-bold tracking-wider">Atualizados</div>
                                            </div>
                                        </div>

                                        {importStats.errors.length > 0 && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                                <h4 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px]">warning</span>
                                                    Erros ({importStats.errors.length})
                                                </h4>
                                                <div className="max-h-32 overflow-y-auto text-xs text-red-300 space-y-1">
                                                    {importStats.errors.map((err, idx) => (
                                                        <div key={idx} className="border-b border-red-500/10 pb-1 last:border-0">{err}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => {
                                                setImportStats(null);
                                                setShowImportModal(false);
                                            }}
                                            className="w-full h-12 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                        >
                                            Concluir
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

