/**
 * Utilitário para tracking de eventos do usuário
 * Facilita o registro de eventos em toda a aplicação
 */

export interface EventoTracking {
    evento_tipo: string;
    evento_nome: string;
    usuario_id?: string | null;
    pagina?: string;
    metadata?: Record<string, any>;
}

/**
 * Registrar um evento de tracking
 * @param evento - Dados do evento
 */
export async function trackEvent(evento: EventoTracking): Promise<void> {
    try {
        // Obter página atual no cliente
        const pagina = typeof window !== "undefined" ? window.location.pathname : null;

        await fetch("/api/track", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...evento,
                pagina: evento.pagina || pagina,
            }),
        });
    } catch (error) {
        // Falha silenciosa - não quebrar a aplicação se tracking falhar
        console.error("Erro ao registrar evento:", error);
    }
}

/**
 * Helpers para eventos comuns
 */
export const tracking = {
    // Eventos de navegação
    pageView: (pagina: string, metadata?: Record<string, any>) =>
        trackEvent({
            evento_tipo: "page_view",
            evento_nome: `Visualizou página: ${pagina}`,
            pagina,
            metadata,
        }),

    // Eventos de formulário
    formStarted: (formName: string, metadata?: Record<string, any>) =>
        trackEvent({
            evento_tipo: "form_started",
            evento_nome: `Iniciou formulário: ${formName}`,
            metadata: { form_name: formName, ...metadata },
        }),

    formFieldFocused: (fieldName: string, formName: string) =>
        trackEvent({
            evento_tipo: "form_field_focused",
            evento_nome: `Focou no campo: ${fieldName}`,
            metadata: { field_name: fieldName, form_name: formName },
        }),

    formSubmitted: (formName: string, success: boolean, metadata?: Record<string, any>) =>
        trackEvent({
            evento_tipo: "form_submitted",
            evento_nome: `${success ? "Submeteu" : "Falhou ao submeter"} formulário: ${formName}`,
            metadata: { form_name: formName, success, ...metadata },
        }),

    // Eventos de consentimento
    consentGiven: (usuarioId: string, metadata?: Record<string, any>) =>
        trackEvent({
            evento_tipo: "consent_given",
            evento_nome: "Deu consentimento",
            usuario_id: usuarioId,
            metadata,
        }),

    // Eventos de processo
    processoFound: (usuarioId: string, numeroProcesso: string) =>
        trackEvent({
            evento_tipo: "processo_found",
            evento_nome: "Processo encontrado",
            usuario_id: usuarioId,
            metadata: { numero_processo: numeroProcesso },
        }),

    processoNotFound: (usuarioId: string) =>
        trackEvent({
            evento_tipo: "processo_not_found",
            evento_nome: "Processo não encontrado",
            usuario_id: usuarioId,
        }),

    // Eventos de ação
    whatsappClicked: (usuarioId?: string, metadata?: Record<string, any>) =>
        trackEvent({
            evento_tipo: "whatsapp_clicked",
            evento_nome: "Clicou no WhatsApp",
            usuario_id: usuarioId || null,
            metadata,
        }),

    copyProcessoNumber: (numeroProcesso: string, usuarioId?: string) =>
        trackEvent({
            evento_tipo: "copy_processo",
            evento_nome: "Copiou número do processo",
            usuario_id: usuarioId || null,
            metadata: { numero_processo: numeroProcesso },
        }),

    // Eventos de erro
    error: (errorType: string, errorMessage: string, metadata?: Record<string, any>) =>
        trackEvent({
            evento_tipo: "error",
            evento_nome: `Erro: ${errorType}`,
            metadata: { error_type: errorType, error_message: errorMessage, ...metadata },
        }),
};

