/**
 * Validação de CPF seguindo o algoritmo padrão brasileiro
 * @param cpf - CPF com ou sem formatação
 * @returns boolean - true se válido, false se inválido
 */
export function validarCPF(cpf: string): boolean {
    const cpfLimpo = limparCPF(cpf);

    // CPF deve ter 11 dígitos
    if (cpfLimpo.length !== 11) return false;

    // CPF não pode ter todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

    // Validar primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(9))) return false;

    // Validar segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(10))) return false;

    return true;
}

/**
 * Validação de email usando regex RFC 5322 simplificado
 * @param email - endereço de email
 * @returns boolean - true se válido
 */
export function validarEmail(email: string): boolean {
    const regexEmail =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regexEmail.test(email.trim());
}

/**
 * Formatar CPF para o padrão xxx.xxx.xxx-xx
 * @param cpf - CPF sem formatação (somente números)
 * @returns string - CPF formatado
 */
export function formatarCPF(cpf: string): string {
    const cpfLimpo = limparCPF(cpf);
    if (cpfLimpo.length !== 11) return cpf;

    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Remover formatação do CPF (pontos e traço)
 * @param cpf - CPF com formatação
 * @returns string - CPF somente com números
 */
export function limparCPF(cpf: string): string {
    return cpf.replace(/\D/g, "");
}

/**
 * Validar nome (não vazio, sem caracteres especiais perigosos)
 * @param nome - nome fornecido
 * @returns boolean - true se válido
 */
export function validarNome(nome: string): boolean {
    const nomeTrimmed = nome.trim();

    // Nome não pode ser vazio
    if (nomeTrimmed.length === 0) return false;

    // Nome deve ter pelo menos 3 caracteres
    if (nomeTrimmed.length < 3) return false;

    // Nome não pode conter números no início
    if (/^\d/.test(nomeTrimmed)) return false;

    // Permitir letras, espaços, acentos, apóstrofos e hífens
    const regexNome = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    return regexNome.test(nomeTrimmed);
}

/**
 * Validar comprimento máximo de string (prevenção injection)
 * @param texto - texto a validar
 * @param maxLength - comprimento máximo permitido
 * @returns boolean - true se válido
 */
export function validarComprimento(texto: string, maxLength: number): boolean {
    return texto.length <= maxLength;
}
