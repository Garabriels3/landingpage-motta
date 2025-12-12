#!/bin/bash

# ============================================
# Script de Importação de CSV para Supabase
# Motta Advocacia - Processos Jurídicos
# ============================================

# Configuração
CSV_FILE="processos.csv"
TABLE_NAME="processos"

# Cores para output
GREEN='\033[0.32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Importação de Processos - Motta Advocacia${NC}"
echo -e "${GREEN}======================================${NC}\n"

# Verificar se o arquivo CSV existe
if [ ! -f "$CSV_FILE" ]; then
    echo -e "${RED}Erro: Arquivo $CSV_FILE não encontrado!${NC}"
    echo -e "${YELLOW}Certifique-se de que o arquivo processos.csv está no mesmo diretório.${NC}"
    exit 1
fi

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Erro: Supabase CLI não está instalado.${NC}"
    echo -e "${YELLOW}Instale com: npm install -g supabase${NC}"
    exit 1
fi

# Verificar se está logado no Supabase
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}Você não está autenticado. Fazendo login...${NC}"
    supabase login
fi

# Listar projetos
echo -e "\n${GREEN}Projetos disponíveis:${NC}"
supabase projects list

# Solicitar Project Ref
echo -e "\n${YELLOW}Digite o Project Ref (ID) do seu projeto Supabase:${NC}"
read -r PROJECT_REF

# Importar CSV
echo -e "\n${GREEN}Importando $CSV_FILE para tabela $TABLE_NAME...${NC}"

# Usar psql via Supabase CLI
supabase db push \
  --project-ref "$PROJECT_REF" \
  --password \
  --file "$CSV_FILE"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Importação concluída com sucesso!${NC}"
else
    echo -e "\n${RED}✗ Erro na importação. Verifique os logs acima.${NC}"
    exit 1
fi

# Verificar registros importados
echo -e "\n${GREEN}Verificando registros importados...${NC}"
echo -e "${YELLOW}(Conecte-se ao Supabase SQL Editor para verificar)${NC}"

echo -e "\n${GREEN}======================================${NC}"
echo -e "${GREEN}Importação finalizada!${NC}"
echo -e "${GREEN}======================================${NC}"
