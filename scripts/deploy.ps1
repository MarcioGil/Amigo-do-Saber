# Script de Deploy Rápido
# Execute após configurar o Azure com setup-azure.ps1

Write-Host "🚀 Deploy Amigo do Saber - Backend e Frontend" -ForegroundColor Cyan
Write-Host ""

# Configurações
$FUNCTION_APP_NAME = "amigo-do-saber-api"
$RESOURCE_GROUP = "amigo-do-saber-rg"

# Verificar se estamos no diretório correto
if (-not (Test-Path ".\backend\package.json")) {
    Write-Host "❌ Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

# Deploy Backend
Write-Host "📦 Preparando backend para deploy..." -ForegroundColor Yellow
Push-Location backend

Write-Host "  → Instalando dependências..." -ForegroundColor Cyan
npm install --production

Write-Host "  → Fazendo deploy para Azure Functions..." -ForegroundColor Cyan
func azure functionapp publish $FUNCTION_APP_NAME

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao fazer deploy do backend" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

# Verificar se Functions estão respondendo
Write-Host ""
Write-Host "🧪 Testando endpoint de saúde..." -ForegroundColor Yellow
$apiUrl = "https://$FUNCTION_APP_NAME.azurewebsites.net"

try {
    $response = Invoke-WebRequest -Uri "$apiUrl/api/Gamificacao/test" -Method GET -TimeoutSec 30 -ErrorAction SilentlyContinue
    Write-Host "✅ API está respondendo!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  API pode levar alguns minutos para inicializar após o deploy" -ForegroundColor Yellow
}

# Deploy Frontend
Write-Host ""
Write-Host "🌐 Frontend será deployado automaticamente via GitHub Actions" -ForegroundColor Yellow
Write-Host "   após fazer push para o repositório" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para fazer deploy manual do frontend:" -ForegroundColor Yellow
Write-Host "1. Faça commit das alterações: git add . && git commit -m 'Deploy to Azure'" -ForegroundColor Cyan
Write-Host "2. Faça push: git push origin main" -ForegroundColor Cyan
Write-Host "3. O GitHub Actions fará o deploy automaticamente" -ForegroundColor Cyan

# Resumo
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ DEPLOY CONCLUÍDO!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 URLs:" -ForegroundColor Yellow
Write-Host "   API: https://$FUNCTION_APP_NAME.azurewebsites.net" -ForegroundColor White
Write-Host "   Frontend: https://amigo-do-saber.azurestaticapps.net" -ForegroundColor White
Write-Host ""
Write-Host "📊 Monitoramento:" -ForegroundColor Yellow
Write-Host "   Portal Azure: https://portal.azure.com/#@/resource/subscriptions" -ForegroundColor White
Write-Host "   Logs: func azure functionapp logstream $FUNCTION_APP_NAME" -ForegroundColor Cyan
Write-Host ""
