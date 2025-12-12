# 📝 Sistema de Gerenciamento de Conteúdos (CMS)

## Visão Geral

Sistema completo para gerenciar textos do site sem precisar mexer no código. Todos os textos podem ser editados através de um painel admin seguro.

## 🔒 Segurança

### Autenticação
- **Autenticação obrigatória**: Todas as operações de escrita requerem `ADMIN_SECRET_KEY`
- **Bearer Token**: Autenticação via header `Authorization: Bearer {ADMIN_SECRET_KEY}`
- **RLS no Supabase**: Row Level Security configurado para proteger dados
- **Validação de dados**: Sanitização e validação de todos os inputs
- **Rate limiting**: Proteção contra abusos (herdado do sistema principal)

### Proteções Implementadas
- ✅ Autenticação forte via `ADMIN_SECRET_KEY`
- ✅ RLS no Supabase (apenas service_role pode escrever)
- ✅ Validação de chaves (apenas letras, números, pontos e hífens)
- ✅ Limite de tamanho de texto (10.000 caracteres)
- ✅ Sanitização de inputs
- ✅ Fallback para textos padrão (não quebra build)

## 🚀 Como Usar

### 1. Acessar o Painel Admin

Acesse: `https://seu-site.com/admin/conteudos`

Você será solicitado a inserir a senha de administrador (valor de `ADMIN_SECRET_KEY`).

### 2. Editar Conteúdos

1. **Filtrar por página** (opcional): Use o dropdown no topo para filtrar conteúdos por página
2. **Encontrar o conteúdo**: Procure pelo conteúdo que deseja editar
3. **Clicar em "Editar"**: O campo de texto ficará editável
4. **Modificar o texto**: Edite o texto diretamente
5. **Salvar**: Clique em "Salvar" para aplicar as mudanças
6. **Cancelar**: Clique em "Cancelar" para descartar

### 3. Estrutura de Chaves

As chaves seguem o padrão: `{pagina}.{secao}.{item}`

Exemplos:
- `homepage.headline` - Título principal da homepage
- `homepage.card1.titulo` - Título do primeiro card
- `confirmacao.whatsapp.botao` - Texto do botão WhatsApp na página de confirmação

## 📋 Conteúdos Disponíveis

### Homepage (`home`)
- `homepage.badge` - Badge "Processo Identificado"
- `homepage.headline` - Título principal
- `homepage.subheadline` - Subtítulo
- `homepage.card1.titulo` - Título do card de segurança
- `homepage.card1.texto` - Texto do card de segurança
- `homepage.card2.titulo` - Título do card de equipe
- `homepage.card2.texto` - Texto do card de equipe
- `homepage.social.titulo` - Título do social proof
- `homepage.social.avaliacao` - Texto de avaliação

### Formulário (`home`)
- `form.titulo` - Título do formulário
- `form.subtitulo` - Subtítulo do formulário
- `form.nome.label` - Label do campo nome
- `form.nome.placeholder` - Placeholder do campo nome
- `form.cpf.label` - Label do campo CPF
- `form.cpf.placeholder` - Placeholder do campo CPF
- `form.email.label` - Label do campo email
- `form.email.placeholder` - Placeholder do campo email
- `form.termos.texto` - Texto do checkbox de termos
- `form.botao` - Texto do botão de submit
- `form.botao.processando` - Texto do botão durante processamento

### Confirmação (`confirmacao`)
- `confirmacao.titulo` - Título da página
- `confirmacao.subtitulo.encontrado` - Subtítulo quando processo encontrado
- `confirmacao.subtitulo.nao_encontrado` - Subtítulo quando não encontrado
- `confirmacao.processo.label` - Label do número do processo
- `confirmacao.processo.copiar` - Texto do botão copiar
- `confirmacao.processo.copiado` - Texto quando copiado
- `confirmacao.whatsapp.titulo` - Título do CTA WhatsApp
- `confirmacao.whatsapp.botao` - Texto do botão WhatsApp
- E muitos outros...

### Header (`header`)
- `header.logo.nome` - Nome no header
- `header.logo.subtitulo` - Subtítulo no header
- `header.badge` - Badge de segurança

## 🔧 API Endpoints

### Público (Leitura)

#### `GET /api/conteudos`
Buscar conteúdos (público, mas usa service_role internamente)

**Query Parameters:**
- `chave` (opcional): Buscar conteúdo específico por chave
- `pagina` (opcional): Buscar todos os conteúdos de uma página

**Exemplo:**
```bash
curl https://seu-site.com/api/conteudos?chave=homepage.headline
```

### Admin (Escrita - Requer Autenticação)

#### `GET /api/admin/conteudos`
Listar todos os conteúdos

**Headers:**
```
Authorization: Bearer {ADMIN_SECRET_KEY}
```

**Query Parameters:**
- `pagina` (opcional): Filtrar por página

#### `POST /api/admin/conteudos`
Criar novo conteúdo

**Headers:**
```
Authorization: Bearer {ADMIN_SECRET_KEY}
Content-Type: application/json
```

**Body:**
```json
{
  "chave": "homepage.novo.texto",
  "texto": "Conteúdo do texto",
  "pagina": "home",
  "tipo": "texto",
  "descricao": "Descrição opcional"
}
```

#### `PUT /api/admin/conteudos`
Atualizar conteúdo existente

**Headers:**
```
Authorization: Bearer {ADMIN_SECRET_KEY}
Content-Type: application/json
```

**Body:**
```json
{
  "chave": "homepage.headline",
  "texto": "Novo texto aqui"
}
```

#### `DELETE /api/admin/conteudos?chave={chave}`
Deletar conteúdo

**Headers:**
```
Authorization: Bearer {ADMIN_SECRET_KEY}
```

## 🛡️ Fallback System

O sistema foi projetado para **nunca quebrar o build**:

1. **Durante o build**: Sempre usa textos padrão (fallback)
2. **Em runtime**: Busca do Supabase, mas mantém fallback se falhar
3. **Cache**: Conteúdos são cacheados por 5 minutos para performance

### Como Funciona

```tsx
<ConteudoText
  chave="homepage.headline"
  fallback="Identificamos um direito a seu favor."
  className="text-4xl font-bold"
  as="h1"
/>
```

- Se o Supabase estiver disponível: usa o texto do banco
- Se houver erro: usa o fallback
- Durante build: sempre usa fallback

## 📊 Banco de Dados

### Tabela: `conteudos`

```sql
CREATE TABLE conteudos (
  id UUID PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  texto TEXT NOT NULL,
  pagina TEXT NOT NULL,
  tipo TEXT DEFAULT 'texto',
  descricao TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### RLS Policies

- **Service role full access**: Apenas service_role pode escrever
- **Public read**: Leitura pública permitida (mas na prática usa service_role via API)

## ⚙️ Configuração

### Variáveis de Ambiente

Certifique-se de ter configurado:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-service-role-key
ADMIN_SECRET_KEY=sua-senha-admin-segura
```

### Criar Dados Iniciais

Os dados iniciais são criados automaticamente pela migration `V2__create_conteudos_table.sql`.

Se precisar recriar:

```sql
-- Execute no SQL Editor do Supabase
-- O arquivo está em: db/migrations/V2__create_conteudos_table.sql
```

## 🐛 Troubleshooting

### Conteúdos não aparecem no site

1. Verifique se a tabela `conteudos` existe no Supabase
2. Verifique se os dados foram inseridos (execute a migration)
3. Verifique as variáveis de ambiente
4. Verifique os logs do console do navegador

### Erro de autenticação no admin

1. Verifique se `ADMIN_SECRET_KEY` está configurado
2. Certifique-se de usar exatamente o mesmo valor
3. Limpe o cache do navegador (localStorage)

### Build quebra

O sistema foi projetado para **nunca quebrar o build**. Se isso acontecer:

1. Verifique se `lib/conteudos.ts` está usando fallbacks corretamente
2. Verifique se `components/ConteudoText.tsx` está implementado corretamente
3. Verifique os logs de build para identificar o problema específico

## 📝 Boas Práticas

1. **Sempre use fallbacks**: Sempre forneça um texto de fallback
2. **Chaves descritivas**: Use chaves claras e organizadas
3. **Teste após editar**: Sempre teste o site após fazer mudanças
4. **Backup**: Considere fazer backup dos conteúdos antes de grandes mudanças
5. **Validação**: O sistema valida automaticamente, mas revise antes de salvar

## 🔄 Adicionar Novos Conteúdos

Para adicionar novos conteúdos editáveis:

1. **Adicione na migration**: Adicione o conteúdo inicial em `db/migrations/V2__create_conteudos_table.sql`
2. **Use no componente**: Use `<ConteudoText>` no componente React
3. **Execute migration**: Execute a migration no Supabase (se necessário)

Exemplo:

```tsx
// No componente
<ConteudoText
  chave="nova.secao.texto"
  fallback="Texto padrão aqui"
  className="text-lg"
  as="p"
/>
```

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do servidor
2. Verifique o console do navegador
3. Verifique as variáveis de ambiente
4. Consulte este documento

