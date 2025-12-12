# Documentação LGPD - Wagner Chaves Advocacia

## ⚖️ Aviso Legal Importante

> **Este documento fornece diretrizes técnicas e boas práticas para conformidade com a LGPD (Lei Geral de Proteção de Dados - Lei 13.709/2018). No entanto, NÃO constitui aconselhamento jurídico.**
> 
> **É OBRIGATÓRIO consultar um advogado especializado em Direito Digital e Proteção de Dados antes de colocar este sistema em produção.**

---

## 📊 Dados Coletados

### Dados Pessoais Tratados

| Dado | Tipo | Finalidade | Base Legal |
|------|------|------------|------------|
| Nome completo | Identificação | Comunicação e identificação do titular | Consentimento (Art. 7º, I) |
| CPF | Identificação | Verificação de processo jurídico | Consentimento (Art. 7º, I) |
| E-mail | Contato | Comunicações sobre o processo | Consentimento (Art. 7º, I) |
| Endereço IP | Técnico | Auditoria e segurança | Legítimo interesse (Art. 7º, IX) |
| User-Agent | Técnico | Auditoria e segurança | Legítimo interesse (Art. 7º, IX) |
| Timestamp | Temporal | Registro de consentimento | Legítimo interesse (Art. 7º, IX) |
| Hash dos Termos | Prova | Evidência do consentimento | Legítimo interesse (Art. 7º, IX) |

### Dados NÃO Coletados

- ❌ Dados sensíveis (raça, religião, saúde, etc.)
- ❌ Dados de crianças ou adolescentes
- ❌ Dados financeiros
- ❌ Dados de localização geográfica precisa

---

## 🎯 Finalidade do Tratamento

Os dados pessoais são coletados exclusivamente para:

1. **Verificação de Processos Jurídicos**: Consultar se existe um processo judicial em nome do titular
2. **Comunicação**: Entrar em contato sobre oportunidades de restituição ou processos identificados
3. **Registro de Consentimento**: Manter prova legal do consentimento conforme LGPD
4. **Auditoria e Segurança**: Detectar e prevenir fraudes, abusos ou acessos não autorizados

**Importante**: Os dados **NÃO** serão utilizados para:
- ❌ Marketing não relacionado
- ❌ Compartilhamento com terceiros (exceto quando exigido por lei)
- ❌ Decisões automatizadas sem intervenção humana
- ❌ Perfilamento ou profiling

---

## 📜 Base Legal do Tratamento

### Consentimento (Art. 7º, I da LGPD)

O consentimento é coletado através de:
- ✅ Checkbox obrigatório no formulário
- ✅ Texto claro e destacado dos Termos de Uso
- ✅ Link para Política de Privacidade
- ✅ Ação afirmativa do titular (clicar e marcar)

**Registro do Consentimento**:
- ID único do registro
- Data e hora (timestamp)
- IP do usuário
- User-Agent do navegador
- Hash SHA-256 do texto dos termos apresentados
- Indicação de termos aceitos (boolean)

### Legítimo Interesse (Art. 7º, IX e Art. 10)

Para dados técnicos (IP, User-Agent), a base legal é o **legítimo interesse** do controlador para:
- Segurança da informação
- Prevenção de fraudes
- Auditoria de consentimentos
- Cumprimento de obrigações legais

---

## 🔐 Segurança e Armazenamento

### Medidas Técnicas Implementadas

- ✅ **Criptografia em trânsito**: HTTPS/TLS 1.3
- ✅ **Criptografia em repouso**: Banco de dados criptografado (Supabase)
- ✅ **Controle de acesso**: RLS (Row Level Security) no Postgres
- ✅ **Segregação de ambientes**: Dev, homolog, prod separados
- ✅ **Logs imutáveis**: Tabela append-only (não permite DELETE)
- ✅ **Rate limiting**: Proteção contra scraping e ataques
- ✅ **Validação server-side**: CPF nunca exposto no frontend

### Localização dos Dados

- **Banco de dados**: Supabase (escolha a região no Brasil se possível)
- **Aplicação**: Vercel Edge Network (distribuído globalmente)
- **Backups**: Automáticos via Supabase (retenção de 7 dias no free tier)

---

## 👤 Direitos dos Titulares

Conforme Art. 18 da LGPD, os titulares têm direito a:

### 1. Confirmação e Acesso (Art. 18, I e II)
O titular pode solicitar confirmação da existência de tratamento e acesso aos seus dados.

**Como atender**:
```sql
SELECT * FROM consentimentos WHERE cpf = 'CPF_DO_TITULAR';
```

### 2. Correção (Art. 18, III)
O titular pode solicitar correção de dados incompletos ou desatualizados.

**Como atender**: Atualizar manualmente no banco (Supabase Table Editor) OU criar endpoint dedicado.

### 3. Anonimização ou Bloqueio (Art. 18, IV)
O titular pode solicitar anonimização ou bloqueio de dados desnecessários.

**Como atender**:
```sql
UPDATE consentimentos 
SET cpf = 'ANONIMIZADO', 
    nome_fornecido = 'ANONIMIZADO', 
    email_fornecido = 'ANONIMIZADO'
WHERE id = 'ID_DO_REGISTRO';
```

### 4. Eliminação (Art. 18, VI)
O titular pode solicitar exclusão dos dados (exceto quando há obrigação legal de retenção).

**Como atender**:
```sql
DELETE FROM consentimentos WHERE cpf = 'CPF_DO_TITULAR';
DELETE FROM processos WHERE cpf = 'CPF_DO_TITULAR';
```

⚠️ **Atenção**: Avaliar se há obrigação legal de manter o registro (ex: processos judiciais em andamento).

### 5. Portabilidade (Art. 18, V)
O titular pode solicitar os dados em formato estruturado.

**Como atender**: Exportar CSV via endpoint `/api/admin/export` ou dashboard Supabase.

### 6. Revogação do Consentimento (Art. 18, IX)
O titular pode revogar o consentimento a qualquer momento.

**Como atender**: 
1. Registrar revogação (inserir registro de revogação)
2. Cessar imediatamente o tratamento
3. Excluir ou anonimizar dados (conforme política)

---

## ⏱️ Retenção de Dados

### Política de Retenção Recomendada

| Dado | Prazo de Retenção | Justificativa |
|------|-------------------|---------------|
| Consentimentos | **1 ano** após último contato | Prova de consentimento para defesa legal |
| Processos | **Conforme orientação jurídica** | Pode haver obrigação legal de guarda |
| Logs técnicos (IP, User-Agent) | **6 meses** | Auditoria de segurança |

### Exclusão Automática (Sugerido)

Criar job/cron que executa mensalmente:

```sql
-- Excluir consentimentos com mais de 1 ano sem atividade
DELETE FROM consentimentos 
WHERE created_at < NOW() - INTERVAL '1 year';
```

⚠️ **Antes de implementar**: consultar advogado sobre obrigações de retenção específicas do setor jurídico.

---

## 📧 Processo de Resposta a Solicitações de Titulares

### 1. Recebimento da Solicitação
- Canal: e-mail (ex: `lgpd@mottaadvocacia.com.br`)
- Prazo para resposta: **15 dias** (Art. 18, §3º)

### 2. Identificação do Titular
- Solicitar documento com foto
- Confirmar CPF e dados cadastrais
- Registrar solicitação em sistema de tickets

### 3. Processamento
- Verificar legitimidade da solicitação
- Consultar banco de dados
- Preparar resposta (dados ou confirmação de exclusão)

### 4. Resposta ao Titular
- Enviar dados em formato legível (PDF ou CSV)
- Confirmar ação tomada (exclusão, correção, etc.)
- Informar sobre possibilidade de recorrer à ANPD

---

## 🛡️ Governança e Responsabilidades

### Controlador de Dados
**Wagner Chaves Advocacia** (CNPJ/Razão Social)

Responsável por:
- Definir finalidades do tratamento
- Implementar medidas de segurança
- Responder a solicitações de titulares
- Notificar vazamentos à ANPD (se ocorrerem)

### Operador de Dados
**Supabase Inc.** (infraestrutura de banco de dados)
**Vercel Inc.** (hospedagem da aplicação)

Responsáveis por:
- Processar dados conforme instruções do Controlador
- Implementar segurança na infraestrutura
- Notificar incidentes de segurança

### Encarregado de Dados (DPO)
⚠️ **PENDENTE**: Nomear Encarregado de Proteção de Dados (pode ser interno ou terceirizado)

Contato: `dpo@wagnerchaves.adv.br` (exemplo)

---

## 🚨 Incidentes de Segurança

### Procedimento em Caso de Vazamento

1. **Detecção**: Identificar o incidente (ex: acesso não autorizado)
2. **Contenção**: Bloquear acesso, trocar credenciais
3. **Avaliação**: Determinar dados afetados e titulares impactados
4. **Notificação à ANPD**: Prazo de **2 dias úteis** (se houver risco relevante)
5. **Comunicação aos Titulares**: Se houver risco ou dano relevante
6. **Documentação**: Registrar incidente e ações tomadas
7. **Correção**: Implementar melhorias para evitar recorrência

### Contato ANPD
- Site: https://www.gov.br/anpd
- Formulário: https://www.gov.br/anpd/pt-br/canais-de-atendimento

---

## ✅ Checklist de Compliance

Use este checklist antes de entrar em produção:

- [ ] Revisar documentação com advogado especializado em LGPD
- [ ] Nomear Encarregado de Dados (DPO)
- [ ] Publicar Política de Privacidade acessível no site
- [ ] Publicar Termos de Uso com linguagem clara
- [ ] Implementar processo de resposta a solicitações de titulares
- [ ] Configurar backup e retenção de dados conforme política
- [ ] Testar processo de exclusão de dados
- [ ] Documentar contratos com operadores (Supabase, Vercel)
- [ ] Realizar RIPD (Relatório de Impacto à Proteção de Dados) se aplicável
- [ ] Treinar equipe sobre LGPD e procedimentos
- [ ] Estabelecer canal de comunicação para titulares (email LGPD)
- [ ] Preparar template de resposta para solicitações de titulares

---

## 📚 Referências Legais

- **LGPD**: [Lei 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- **ANPD**: [Autoridade Nacional de Proteção de Dados](https://www.gov.br/anpd)
- **Guia de Boas Práticas**: [ANPD - Guia Orientativo](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes)

---

## 🆘 Dúvidas Frequentes

**Q: Posso usar estes dados para marketing?**  
R: Não, a menos que obtenha consentimento específico e destacado para essa finalidade.

**Q: Preciso notificar a ANPD se houver um acesso não autorizado?**  
R: Sim, se houver risco relevante aos direitos dos titulares (prazo: 2 dias úteis).

**Q: Por quanto tempo posso guardar os consentimentos?**  
R: Recomenda-se 1 ano após último contato, mas consulte seu advogado sobre especificidades do setor jurídico.

**Q: Posso transferir dados para fora do Brasil?**  
R: Sim, desde que o país de destino ofereça grau adequado de proteção OU mediante cláusulas contratuais específicas (Art. 33).

---

**Última atualização**: 2025-01-01  
**Versão**: 1.0

**LEMBRE-SE**: Esta documentação é um ponto de partida. Consulte um advogado especializado antes de usar este sistema com dados reais.
