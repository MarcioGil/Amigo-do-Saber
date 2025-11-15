# Guia Completo de Setup - Amigo do Saber

Este guia detalha todos os passos para configurar e fazer o deploy da plataforma Amigo do Saber no Azure.

## 📋 Pré-requisitos

Antes de começar, você precisará de:

- [ ] Conta no Azure (free tier disponível)
- [ ] Node.js 18+ instalado
- [ ] Azure CLI instalado
- [ ] Git instalado
- [ ] Conta no GitHub

## 🚀 Passo 1: Instalar Azure CLI

### Windows (PowerShell):

```powershell
winget install -e --id Microsoft.AzureCLI
```

### Verificar instalação:

```powershell
az --version
```

## 🔐 Passo 2: Login no Azure

```powershell
az login
```

Isso abrirá seu navegador para autenticação. Após login, você verá suas assinaturas.

### Selecionar assinatura (se tiver múltiplas):

```powershell
az account list --output table
az account set --subscription "NOME_OU_ID_DA_ASSINATURA"
```

## 🗂️ Passo 3: Criar Resource Group

```powershell
az group create --name amigo-do-saber-rg --location brazilsouth
```

💡 **Nota**: `brazilsouth` = São Paulo (menor latência para usuários no Brasil)

## 📦 Passo 4: Criar Cosmos DB (Free Tier)

### Criar conta Cosmos DB:

```powershell
az cosmosdb create `
  --name amigo-do-saber-db `
  --resource-group amigo-do-saber-rg `
  --locations regionName=brazilsouth `
  --enable-free-tier true `
  --default-consistency-level Session
```

⏱️ **Tempo estimado**: 5-10 minutos

### Criar database:

```powershell
az cosmosdb sql database create `
  --account-name amigo-do-saber-db `
  --resource-group amigo-do-saber-rg `
  --name amigo-saber-data
```

### Criar containers:

#### Container: Alunos

```powershell
az cosmosdb sql container create `
  --account-name amigo-do-saber-db `
  --resource-group amigo-do-saber-rg `
  --database-name amigo-saber-data `
  --name Alunos `
  --partition-key-path "/id" `
  --throughput 400
```

#### Container: Progresso

```powershell
az cosmosdb sql container create `
  --account-name amigo-do-saber-db `
  --resource-group amigo-do-saber-rg `
  --database-name amigo-saber-data `
  --name Progresso `
  --partition-key-path "/alunoId" `
  --throughput 400
```

#### Container: Gamificacao

```powershell
az cosmosdb sql container create `
  --account-name amigo-do-saber-db `
  --resource-group amigo-do-saber-rg `
  --database-name amigo-saber-data `
  --name Gamificacao `
  --partition-key-path "/alunoId" `
  --throughput 400
```

#### Container: LogsDeUso

```powershell
az cosmosdb sql container create `
  --account-name amigo-do-saber-db `
  --resource-group amigo-do-saber-rg `
  --database-name amigo-saber-data `
  --name LogsDeUso `
  --partition-key-path "/alunoId" `
  --throughput 400
```

### Obter connection string:

```powershell
az cosmosdb keys list `
  --name amigo-do-saber-db `
  --resource-group amigo-do-saber-rg `
  --type connection-strings `
  --query "connectionStrings[0].connectionString" -o tsv
```

⚠️ **IMPORTANTE**: Copie e guarde essa connection string! Você vai precisar dela.

## 🤖 Passo 5: Criar Azure OpenAI Service

### Criar recurso OpenAI:

```powershell
az cognitiveservices account create `
  --name amigo-do-saber-openai `
  --resource-group amigo-do-saber-rg `
  --kind OpenAI `
  --sku S0 `
  --location eastus `
  --yes
```

💡 **Nota**: OpenAI só está disponível em regiões específicas (eastus, westeurope, etc.)

### Fazer deploy do modelo GPT-4:

```powershell
az cognitiveservices account deployment create `
  --name amigo-do-saber-openai `
  --resource-group amigo-do-saber-rg `
  --deployment-name gpt-4 `
  --model-name gpt-4 `
  --model-version "1106-Preview" `
  --model-format OpenAI `
  --sku-capacity 10 `
  --sku-name "Standard"
```

### Obter chave e endpoint:

```powershell
az cognitiveservices account keys list `
  --name amigo-do-saber-openai `
  --resource-group amigo-do-saber-rg

az cognitiveservices account show `
  --name amigo-do-saber-openai `
  --resource-group amigo-do-saber-rg `
  --query "properties.endpoint" -o tsv
```

## ⚡ Passo 6: Criar Azure Functions App

### Criar Storage Account (necessária para Functions):

```powershell
az storage account create `
  --name amigodosaberstorage `
  --resource-group amigo-do-saber-rg `
  --location brazilsouth `
  --sku Standard_LRS
```

### Criar Function App:

```powershell
az functionapp create `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --storage-account amigodosaberstorage `
  --consumption-plan-location brazilsouth `
  --runtime node `
  --runtime-version 18 `
  --functions-version 4 `
  --os-type Windows
```

### Configurar variáveis de ambiente:

```powershell
# Cosmos DB
az functionapp config appsettings set `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --settings "COSMOS_ENDPOINT=https://amigo-do-saber-db.documents.azure.com:443/"

az functionapp config appsettings set `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --settings "COSMOS_KEY=SUA_COSMOS_KEY_AQUI"

# OpenAI
az functionapp config appsettings set `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --settings "OPENAI_API_KEY=SUA_OPENAI_KEY_AQUI"

az functionapp config appsettings set `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --settings "OPENAI_ENDPOINT=SEU_OPENAI_ENDPOINT_AQUI"

# JWT Secret
az functionapp config appsettings set `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --settings "JWT_SECRET=$(openssl rand -base64 32)"
```

### Habilitar CORS:

```powershell
az functionapp cors add `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --allowed-origins "https://amigo-do-saber.azurestaticapps.net"
```

## 🌐 Passo 7: Deploy do Backend (Azure Functions)

### Navegar para a pasta backend:

```powershell
cd backend
```

### Instalar dependências:

```powershell
npm install
```

### Fazer deploy:

```powershell
npm install -g azure-functions-core-tools@4

func azure functionapp publish amigo-do-saber-api
```

## 🎨 Passo 8: Deploy do Frontend (Azure Static Web Apps)

### Criar Static Web App:

```powershell
az staticwebapp create `
  --name amigo-do-saber `
  --resource-group amigo-do-saber-rg `
  --location brazilsouth `
  --source https://github.com/SEU_USUARIO/Amigo-do-Saber `
  --branch main `
  --app-location "/frontend" `
  --output-location "/"
```

### Obter deployment token:

```powershell
az staticwebapp secrets list `
  --name amigo-do-saber `
  --resource-group amigo-do-saber-rg `
  --query "properties.apiKey" -o tsv
```

💡 **Nota**: Guarde esse token para configurar no GitHub Actions

## 🔧 Passo 9: Configurar Local Settings (Desenvolvimento Local)

### Criar arquivo `backend/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_ENDPOINT": "https://amigo-do-saber-db.documents.azure.com:443/",
    "COSMOS_KEY": "SUA_COSMOS_KEY",
    "OPENAI_API_KEY": "SUA_OPENAI_KEY",
    "OPENAI_ENDPOINT": "SEU_OPENAI_ENDPOINT",
    "OPENAI_DEPLOYMENT_NAME": "gpt-4",
    "JWT_SECRET": "seu-secret-super-seguro-aqui"
  },
  "Host": {
    "CORS": "*",
    "CORSCredentials": false
  }
}
```

### Atualizar `frontend/js/config.js`:

```javascript
const CONFIG = {
  API_BASE_URL: "https://amigo-do-saber-api.azurewebsites.net/api",
  // Para desenvolvimento local:
  // API_BASE_URL: 'http://localhost:7071/api',
}
```

## 🧪 Passo 10: Testar Localmente

### Terminal 1 - Backend:

```powershell
cd backend
func start
```

### Terminal 2 - Frontend:

```powershell
cd frontend
npx http-server -p 8080
```

Acesse: http://localhost:8080

## 📊 Passo 11: Monitoramento e Logs

### Ver logs das Functions:

```powershell
az monitor app-insights component show `
  --app amigo-do-saber-api `
  --resource-group amigo-do-saber-rg
```

### Stream de logs em tempo real:

```powershell
func azure functionapp logstream amigo-do-saber-api
```

## 💰 Estimativa de Custos (Free Tier)

- ✅ **Cosmos DB**: Grátis (1000 RU/s + 25GB)
- ✅ **Azure Functions**: Grátis (1M execuções/mês)
- ✅ **Static Web Apps**: Grátis (100GB bandwidth/mês)
- ⚠️ **Azure OpenAI**: ~$0.03 por 1K tokens (custo variável)

💡 **Estimativa mensal**: ~$10-30 (principalmente OpenAI)

## 🔐 Segurança - Próximos Passos

1. **Implementar Azure AD B2C** para autenticação
2. **Configurar Key Vault** para secrets
3. **Habilitar Application Insights** para monitoramento
4. **Configurar alertas** de custo no Azure
5. **Implementar rate limiting** nas APIs

## 🆘 Troubleshooting

### Erro: "Subscription not found"

```powershell
az account list
az account set --subscription "ID_DA_ASSINATURA"
```

### Erro: "Free tier already used"

- Você só pode ter 1 Cosmos DB Free Tier por assinatura
- Solução: Use uma assinatura diferente ou pague pelo serviço

### Functions não respondem:

```powershell
# Reiniciar Function App
az functionapp restart --name amigo-do-saber-api --resource-group amigo-do-saber-rg

# Ver logs
func azure functionapp logstream amigo-do-saber-api
```

### Frontend não carrega:

- Verifique se a URL da API está correta em `config.js`
- Verifique CORS nas Functions
- Verifique o console do navegador (F12)

## 📚 Recursos Úteis

- [Azure Functions Docs](https://docs.microsoft.com/azure/azure-functions/)
- [Cosmos DB Docs](https://docs.microsoft.com/azure/cosmos-db/)
- [Azure OpenAI Docs](https://docs.microsoft.com/azure/cognitive-services/openai/)
- [Static Web Apps Docs](https://docs.microsoft.com/azure/static-web-apps/)

## ✅ Checklist Final

- [ ] Cosmos DB criado e containers configurados
- [ ] Azure OpenAI configurado com modelo GPT-4
- [ ] Functions App criada e configurada
- [ ] Backend deployado
- [ ] Static Web App criada
- [ ] Frontend deployado
- [ ] Variáveis de ambiente configuradas
- [ ] CORS habilitado
- [ ] Teste local funcionando
- [ ] Deploy em produção funcionando
- [ ] Monitoramento configurado

---

🎉 **Parabéns!** Sua plataforma Amigo do Saber está no ar!

Acesse: https://amigo-do-saber.azurestaticapps.net
