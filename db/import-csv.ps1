# ============================================
# Script de Importação de CSV para Supabase (PowerShell)
# Motta Advocacia - Processos Jurídicos
# ============================================

$CsvFile = "processos.csv"
$TableName = "processos"

Write-Host "======================================" -ForegroundColor Green
Write-Host "Importação de Processos - Motta Advocacia" -ForegroundColor Green
Write-Host "======================================`n" -ForegroundColor Green

# Verificar se o arquivo CSV existe
if (-Not (Test-Path $CsvFile)) {
    Write-Host "Erro: Arquivo $CsvFile não encontrado!" -ForegroundColor Red
    Write-Host "Certifique-se de que o arquivo processos.csv está no mesmo diretório." -ForegroundColor Yellow
    exit 1
}

Write-Host "Arquivo CSV encontrado: $CsvFile" -ForegroundColor Green
Write-Host "Total de linhas: $((Get-Content $CsvFile).Count - 1)`n" -ForegroundColor Cyan

# Ler variáveis de ambiente
$SupabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$SupabaseKey = $env:SUPABASE_SERVICE_KEY

if (-Not $SupabaseUrl -or -Not $SupabaseKey) {
    Write-Host "Erro: Variáveis de ambiente não configuradas!" -ForegroundColor Red
    Write-Host "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_KEY" -ForegroundColor Yellow
    exit 1
}

# Ler CSV
Write-Host "Lendo arquivo CSV..." -ForegroundColor Yellow
$Csv = Import-Csv $CsvFile

$TotalRecords = $Csv.Count
$SuccessCount = 0
$ErrorCount = 0

Write-Host "Iniciando importação de $TotalRecords registros...`n" -ForegroundColor Green

foreach ($Row in $Csv) {
    try {
        # Limpar CPF (remover formatação)
        $CpfLimpo = $Row.cpf -replace '\D', ''
        
        # Preparar dados
        $Data = @{
            cpf = $CpfLimpo
            numero_processo = $Row.numero_processo
            origem = if ($Row.origem) { $Row.origem } else { "Import-$(Get-Date -Format 'yyyy-MM-dd')" }
        } | ConvertTo-Json

        # Fazer POST para Supabase
        $Headers = @{
            "apikey" = $SupabaseKey
            "Authorization" = "Bearer $SupabaseKey"
            "Content-Type" = "application/json"
            "Prefer" = "resolution=merge-duplicates"
        }

        $Response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/$TableName" `
            -Method Post `
            -Headers $Headers `
            -Body $Data `
            -ErrorAction Stop

        $SuccessCount++
        Write-Host "✓ Importado: CPF *** *** ***-$($CpfLimpo.Substring($CpfLimpo.Length - 2)) | Processo: $($Row.numero_processo)" -ForegroundColor Green

    } catch {
        $ErrorCount++
        Write-Host "✗ Erro ao importar CPF $($Row.cpf): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n======================================" -ForegroundColor Green
Write-Host "Importação finalizada!" -ForegroundColor Green
Write-Host "Total: $TotalRecords | Sucesso: $SuccessCount | Erros: $ErrorCount" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Green
