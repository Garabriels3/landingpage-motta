"use client";
import { useState, useEffect } from "react";

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "termos" | "privacidade";
}

// Textos genéricos padrão (fallback se não tiver no Supabase)
const defaultContent = {
    termos: {
        title: "Termos de Uso",
        content: `
## 1. Aceitação dos Termos

Ao acessar e usar este site, você aceita e concorda em cumprir estes termos e condições de uso.

## 2. Serviços

Este site oferece serviços de advocacia especializada em restituições e processos jurídicos. Os serviços são prestados por profissionais devidamente habilitados pela Ordem dos Advogados do Brasil (OAB).

## 3. Coleta de Dados

Coletamos dados pessoais como nome, CPF e e-mail exclusivamente para:
- Identificar processos jurídicos relacionados ao usuário
- Entrar em contato para dar andamento aos procedimentos legais
- Cumprir obrigações legais e regulatórias

## 4. Responsabilidades

O usuário é responsável pela veracidade das informações fornecidas. Dados incorretos podem inviabilizar a prestação dos serviços.

## 5. Propriedade Intelectual

Todo o conteúdo deste site, incluindo textos, imagens e logotipos, é protegido por direitos autorais e não pode ser reproduzido sem autorização prévia.

## 6. Limitação de Responsabilidade

As informações contidas neste site têm caráter informativo e não constituem aconselhamento jurídico específico. O envio de dados não estabelece, por si só, relação advogado-cliente.

## 7. Alterações

Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor imediatamente após sua publicação.

## 8. Contato

Para dúvidas sobre estes termos, entre em contato conosco através dos canais disponibilizados neste site.
        `
    },
    privacidade: {
        title: "Política de Privacidade",
        content: `
## 1. Introdução

Esta Política de Privacidade descreve como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

## 2. Dados Coletados

Coletamos os seguintes dados pessoais:
- **Nome completo**: Para identificação
- **CPF**: Para consulta de processos jurídicos
- **E-mail**: Para comunicação sobre andamento dos processos

## 3. Finalidade do Tratamento

Seus dados são utilizados para:
- Identificar processos jurídicos em seu nome
- Entrar em contato sobre oportunidades de restituição
- Prestar assessoria jurídica especializada
- Cumprir obrigações legais

## 4. Base Legal

O tratamento dos dados é realizado com base no:
- **Consentimento** do titular (Art. 7º, I da LGPD)
- **Execução de contrato** ou procedimentos preliminares (Art. 7º, V da LGPD)
- **Cumprimento de obrigação legal** (Art. 7º, II da LGPD)

## 5. Compartilhamento de Dados

Seus dados podem ser compartilhados com:
- Órgãos do Poder Judiciário (quando necessário para processos)
- Prestadores de serviços essenciais (com contratos de confidencialidade)

**Não vendemos ou comercializamos seus dados pessoais.**

## 6. Segurança

Implementamos medidas técnicas e organizacionais para proteger seus dados:
- Criptografia de dados em trânsito (SSL/TLS)
- Controle de acesso restrito
- Backup seguro das informações

## 7. Seus Direitos

Você tem direito a:
- Confirmar a existência de tratamento de dados
- Acessar seus dados pessoais
- Corrigir dados incompletos ou desatualizados
- Solicitar a exclusão de dados (quando aplicável)
- Revogar o consentimento

## 8. Retenção de Dados

Mantemos seus dados pelo período necessário para:
- Cumprimento das finalidades descritas
- Atendimento a obrigações legais
- Exercício regular de direitos em processos

## 9. Contato do Encarregado (DPO)

Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato conosco pelos canais disponibilizados neste site.

## 10. Atualizações

Esta política pode ser atualizada periodicamente. Recomendamos sua consulta regular.

**Última atualização:** Dezembro de 2024
        `
    }
};

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
    const [content, setContent] = useState<{ title: string; content: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchContent = async () => {
            setLoading(true);
            try {
                // Tentar buscar do Supabase via API
                const response = await fetch(`/api/legal?type=${type}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.content) {
                        setContent({ title: data.title, content: data.content });
                        setLoading(false);
                        return;
                    }
                }
            } catch {
                // Fallback para conteúdo padrão
            }
            // Usar conteúdo padrão
            setContent(defaultContent[type]);
            setLoading(false);
        };

        fetchContent();
    }, [isOpen, type]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white dark:bg-dark-paper border-2 border-primary dark:border-dark-border rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex-none bg-white dark:bg-dark-paper border-b border-primary/20 dark:border-dark-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
                    <h2 className="text-xl font-bold text-text-main dark:text-dark-textMain">
                        {loading ? "Carregando..." : content?.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                    >
                        <span className="material-symbols-outlined text-primary-darker dark:text-primary">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none
                            prose-headings:text-text-main dark:prose-headings:text-dark-textMain
                            prose-p:text-gray-600 dark:prose-p:text-dark-textBody
                            prose-li:text-gray-600 dark:prose-li:text-dark-textBody
                            prose-strong:text-gray-700 dark:prose-strong:text-dark-textMain
                            pb-4
                        ">
                            {content?.content.split('\n').map((line, i) => {
                                if (line.startsWith('## ')) {
                                    return <h2 key={i} className="text-lg font-bold mt-6 mb-3 text-text-main dark:text-dark-textMain">{line.replace('## ', '')}</h2>;
                                }
                                if (line.startsWith('- **')) {
                                    const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
                                    if (match) {
                                        return <p key={i} className="ml-4 my-1"><strong className="text-gray-700 dark:text-dark-textMain">{match[1]}:</strong> {match[2]}</p>;
                                    }
                                }
                                if (line.startsWith('- ')) {
                                    return <p key={i} className="ml-4 my-1">• {line.replace('- ', '')}</p>;
                                }
                                if (line.startsWith('**') && line.endsWith('**')) {
                                    return <p key={i} className="font-semibold text-gray-700 dark:text-dark-textMain mt-4">{line.replace(/\*\*/g, '')}</p>;
                                }
                                if (line.trim()) {
                                    return <p key={i} className="my-2 text-gray-600 dark:text-dark-textBody leading-relaxed">{line}</p>;
                                }
                                return null;
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-none bg-white dark:bg-dark-paper border-t border-primary/20 dark:border-dark-border px-6 py-4 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-colors"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
}
