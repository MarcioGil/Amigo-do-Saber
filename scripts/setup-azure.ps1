# Script de Setup Automatizado - Amigo do Saber
# Execute este script no PowerShell como Administrador

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "amigo-do-saber-rg",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "brazilsouth",
    
    [Parameter(Mandatory=$false)]
    [string]$CosmosDBName = "amigo-do-saber-db",
    
    [Parameter(Mandatory=$false)]
    [string]$FunctionAppName = "amigo-do-saber-api",
    
    [Parameter(Mandatory=$false)]
    [string]$OpenAIName = "amigo-do-saber-openai",
    
    [Parameter(Mandatory=$false)]
    [string]$StaticWebAppName = "amigo-do-saber"
)

Write-Host "🚀 Iniciando setup do Amigo do Saber no Azure..." -ForegroundColor Cyan
Write-Host ""

# Verificar se Azure CLI está instalado
Write-Host "📋 Verificando Azure CLI..." -ForegroundColor Yellow
$azVersion = az --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Azure CLI não encontrado!" -ForegroundColor Red
    Write-Host "Instalando Azure CLI..." -ForegroundColor Yellow
    winget install -e --id Microsoft.AzureCLI
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar Azure CLI. Instale manualmente: https://aka.ms/installazurecliwindows" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Azure CLI instalado" -ForegroundColor Green

# Login no Azure
Write-Host ""
Write-Host "🔐 Fazendo login no Azure..." -ForegroundColor Yellow
az login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer login no Azure" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Login realizado com sucesso" -ForegroundColor Green

# Selecionar assinatura
Write-Host ""
Write-Host "📋 Assinaturas disponíveis:" -ForegroundColor Yellow
az account list --output table
Write-Host ""
$subscriptionId = Read-Host "Digite o ID da assinatura que deseja usar (Enter para usar a padrão)"
if ($subscriptionId) {
    az account set --subscription $subscriptionId
}

# Criar Resource Group
Write-Host ""
Write-Host "📦 Criando Resource Group: $ResourceGroup..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Resource Group criado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Resource Group já existe ou erro ao criar" -ForegroundColor Yellow
}

# Criar Cosmos DB
Write-Host ""
Write-Host "🗄️  Criando Cosmos DB (isso pode levar 5-10 minutos)..." -ForegroundColor Yellow
az cosmosdb create `
    --name $CosmosDBName `
    --resource-group $ResourceGroup `
    --locations regionName=$Location `
    --enable-free-tier true `
    --default-consistency-level Session `
    --output none

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Cosmos DB criado" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao criar Cosmos DB (talvez já exista ou free tier já usado)" -ForegroundColor Red
}

# Criar Database
Write-Host ""
Write-Host "📚 Criando database..." -ForegroundColor Yellow
az cosmosdb sql database create `
    --account-name $CosmosDBName `
    --resource-group $ResourceGroup `
    --name amigo-saber-data `
    --output none

# Criar Containers
Write-Host ""
Write-Host "📊 Criando containers..." -ForegroundColor Yellow

$containers = @("Alunos", "Progresso", "Gamificacao", "LogsDeUso")
$partitionKeys = @{
    "Alunos" = "/id"
    "Progresso" = "/alunoId"
    "Gamificacao" = "/alunoId"
    "LogsDeUso" = "/alunoId"
}

foreach ($container in $containers) {
    Write-Host "  - Criando container: $container" -ForegroundColor Cyan
    az cosmosdb sql container create `
        --account-name $CosmosDBName `
        --resource-group $ResourceGroup `
        --database-name amigo-saber-data `
        --name $container `
        --partition-key-path $partitionKeys[$container] `
        --throughput 400 `
        --output none
}
Write-Host "✅ Containers criados" -ForegroundColor Green

# Obter Cosmos DB Connection String
Write-Host ""
Write-Host "🔑 Obtendo Cosmos DB connection string..." -ForegroundColor Yellow
$cosmosConnection = az cosmosdb keys list `
    --name $CosmosDBName `
    --resource-group $ResourceGroup `
    --type connection-strings `
    --query "connectionStrings[0].connectionString" -o tsv

$cosmosEndpoint = "https://$CosmosDBName.documents.azure.com:443/"
$cosmosKey = az cosmosdb keys list `
    --name $CosmosDBName `
    --resource-group $ResourceGroup `
    --query "primaryMasterKey" -o tsv

# Criar Azure OpenAI
Write-Host ""
Write-Host "🤖 Criando Azure OpenAI Service..." -ForegroundColor Yellow
az cognitiveservices account create `
    --name $OpenAIName `
    --resource-group $ResourceGroup `
    --kind OpenAI `
    --sku S0 `
    --location eastus `
    --yes `
    --output none

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Azure OpenAI criado" -ForegroundColor Green
    
    # Deploy GPT-4
    Write-Host "🧠 Fazendo deploy do modelo GPT-4..." -ForegroundColor Yellow
    az cognitiveservices account deployment create `
        --name $OpenAIName `
        --resource-group $ResourceGroup `
        --deployment-name gpt-4 `
        --model-name gpt-4 `
        --model-version "1106-Preview" `
        --model-format OpenAI `
        --sku-capacity 10 `
        --sku-name "Standard" `
        --output none
    
    # Obter chaves
    $openaiKey = az cognitiveservices account keys list `
        --name $OpenAIName `
        --resource-group $ResourceGroup `
        --query "key1" -o tsv
    
    $openaiEndpoint = az cognitiveservices account show `
        --name $OpenAIName `
        --resource-group $ResourceGroup `
        --query "properties.endpoint" -o tsv
} else {
    Write-Host "⚠️  Erro ao criar Azure OpenAI (pode não estar disponível na sua região)" -ForegroundColor Yellow
    $openaiKey = "CONFIGURE_MANUALMENTE"
    $openaiEndpoint = "CONFIGURE_MANUALMENTE"
}

# Criar Storage Account
Write-Host ""
Write-Host "💾 Criando Storage Account..." -ForegroundColor Yellow
$storageAccountName = ($FunctionAppName -replace '-', '') + "storage"
az storage account create `
    --name $storageAccountName `
    --resource-group $ResourceGroup `
    --location $Location `
    --sku Standard_LRS `
    --output none
Write-Host "✅ Storage Account criado" -ForegroundColor Green

# Criar Function App
Write-Host ""
Write-Host "⚡ Criando Function App..." -ForegroundColor Yellow
az functionapp create `
    --name $FunctionAppName `
    --resource-group $ResourceGroup `
    --storage-account $storageAccountName `
    --consumption-plan-location $Location `
    --runtime node `
    --runtime-version 18 `
    --functions-version 4 `
    --os-type Windows `
    --output none
Write-Host "✅ Function App criado" -ForegroundColor Green

# Configurar variáveis de ambiente
Write-Host ""
Write-Host "🔧 Configurando variáveis de ambiente..." -ForegroundColor Yellow

$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

az functionapp config appsettings set `
    --name $FunctionAppName `
    --resource-group $ResourceGroup `
    --settings "COSMOS_ENDPOINT=$cosmosEndpoint" `
    --output none

az functionapp config appsettings set `
    --name $FunctionAppName `
    --resource-group $ResourceGroup `
    --settings "COSMOS_KEY=$cosmosKey" `
    --output none

az functionapp config appsettings set `
    --name $FunctionAppName `
    --resource-group $ResourceGroup `
    --settings "OPENAI_API_KEY=$openaiKey" `
    --output none

az functionapp config appsettings set `
    --name $FunctionAppName `
    --resource-group $ResourceGroup `
    --settings "OPENAI_ENDPOINT=$openaiEndpoint" `
    --output none

az functionapp config appsettings set `
    --name $FunctionAppName `
    --resource-group $ResourceGroup `
    --settings "OPENAI_DEPLOYMENT_NAME=gpt-4" `
    --output none

az functionapp config appsettings set `
    --name $FunctionAppName `
    --resource-group $ResourceGroup `
    --settings "JWT_SECRET=$jwtSecret" `
    --output none

Write-Host "✅ Variáveis de ambiente configuradas" -ForegroundColor Green

# Criar local.settings.json
Write-Host ""
Write-Host "📝 Criando local.settings.json..." -ForegroundColor Yellow

$localSettings = @{
    IsEncrypted = $false
    Values = @{
        AzureWebJobsStorage = "UseDevelopmentStorage=true"
        FUNCTIONS_WORKER_RUNTIME = "node"
        COSMOS_ENDPOINT = $cosmosEndpoint
        COSMOS_KEY = $cosmosKey
        OPENAI_API_KEY = $openaiKey
        OPENAI_ENDPOINT = $openaiEndpoint
        OPENAI_DEPLOYMENT_NAME = "gpt-4"
        JWT_SECRET = $jwtSecret
    }
    Host = @{
        CORS = "*"
        CORSCredentials = $false
    }
} | ConvertTo-Json -Depth 3

$localSettings | Out-File -FilePath ".\backend\local.settings.json" -Encoding UTF8
Write-Host "✅ local.settings.json criado" -ForegroundColor Green

# Criar Static Web App
Write-Host ""
Write-Host "🌐 Criando Static Web App..." -ForegroundColor Yellow
Write-Host "⚠️  Isso requer que o repositório esteja no GitHub" -ForegroundColor Yellow
$createStatic = Read-Host "Deseja criar Static Web App agora? (s/n)"

if ($createStatic -eq "s") {
    $githubRepo = Read-Host "Digite a URL do repositório GitHub (ex: https://github.com/usuario/repo)"
    
    az staticwebapp create `
        --name $StaticWebAppName `
        --resource-group $ResourceGroup `
        --location $Location `
        --source $githubRepo `
        --branch main `
        --app-location "/frontend" `
        --output-location "/" `
        --output none
    
    Write-Host "✅ Static Web App criado" -ForegroundColor Green
}

# Resumo
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 SETUP CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 INFORMAÇÕES IMPORTANTES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host "Cosmos DB: $CosmosDBName" -ForegroundColor White
Write-Host "Function App: $FunctionAppName" -ForegroundColor White
Write-Host "  URL: https://$FunctionAppName.azurewebsites.net" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔑 CREDENCIAIS (GUARDE COM SEGURANÇA):" -ForegroundColor Yellow
Write-Host ""
Write-Host "Cosmos Endpoint: $cosmosEndpoint" -ForegroundColor White
Write-Host "Cosmos Key: $cosmosKey" -ForegroundColor White
Write-Host ""
Write-Host "OpenAI Endpoint: $openaiEndpoint" -ForegroundColor White
Write-Host "OpenAI Key: $openaiKey" -ForegroundColor White
Write-Host ""
Write-Host "JWT Secret: $jwtSecret" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Instalar dependências do backend:" -ForegroundColor White
Write-Host "   cd backend && npm install" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Testar localmente:" -ForegroundColor White
Write-Host "   func start" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Fazer deploy do backend:" -ForegroundColor White
Write-Host "   func azure functionapp publish $FunctionAppName" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Configurar GitHub Actions com os secrets:" -ForegroundColor White
Write-Host "   - AZURE_FUNCTIONAPP_PUBLISH_PROFILE" -ForegroundColor Cyan
Write-Host "   - AZURE_STATIC_WEB_APPS_API_TOKEN" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Fazer push para GitHub para deploy automático" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Arquivo local.settings.json criado em: .\backend\local.settings.json" -ForegroundColor Green
Write-Host ""
Write-Host "Para mais detalhes, consulte: docs/DEPLOY_AZURE.md" -ForegroundColor Yellow
Write-Host ""
