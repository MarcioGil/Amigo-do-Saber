# Variáveis de Ambiente - Amigo do Saber

## 📝 Descrição das Variáveis

### Azure Functions (Backend)

#### Obrigatórias

| Variável                 | Descrição                      | Onde Obter                          | Exemplo                                              |
| ------------------------ | ------------------------------ | ----------------------------------- | ---------------------------------------------------- |
| `COSMOS_ENDPOINT`        | Endpoint do Cosmos DB          | Portal Azure → Cosmos DB → Keys     | `https://amigo-do-saber-db.documents.azure.com:443/` |
| `COSMOS_KEY`             | Chave primária do Cosmos DB    | Portal Azure → Cosmos DB → Keys     | `abc123...xyz==`                                     |
| `COSMOS_DATABASE`        | Nome do database               | Criado durante setup                | `amigo-saber-data`                                   |
| `OPENAI_API_KEY`         | Chave da API OpenAI            | Portal Azure → OpenAI → Keys        | `sk-...` ou Azure key                                |
| `OPENAI_ENDPOINT`        | Endpoint do Azure OpenAI       | Portal Azure → OpenAI → Overview    | `https://amigo-do-saber-openai.openai.azure.com/`    |
| `OPENAI_DEPLOYMENT_NAME` | Nome do deployment GPT-4       | Portal Azure → OpenAI → Deployments | `gpt-4`                                              |
| `JWT_SECRET`             | Secret para assinar tokens JWT | Gerar aleatório (min 32 chars)      | `ASDf234!@#$...`                                     |

#### Opcionais

| Variável                  | Descrição                   | Padrão               | Exemplo                          |
| ------------------------- | --------------------------- | -------------------- | -------------------------------- |
| `OPENAI_API_VERSION`      | Versão da API OpenAI        | `2024-02-15-preview` | `2024-02-15-preview`             |
| `JWT_EXPIRY_DAYS`         | Dias até expiração do JWT   | `7`                  | `7`                              |
| `RATE_LIMIT_TIA_DORA`     | Max perguntas/hora Tia Dora | `50`                 | `50`                             |
| `RATE_LIMIT_WINDOW_HOURS` | Janela de rate limit        | `1`                  | `1`                              |
| `NODE_ENV`                | Ambiente de execução        | `production`         | `development` ou `production`    |
| `LOG_LEVEL`               | Nível de logging            | `info`               | `debug`, `info`, `warn`, `error` |

### Frontend (JavaScript)

Configuradas em `frontend/js/config.js`:

| Variável                 | Descrição                   | Desenvolvimento             | Produção                                           |
| ------------------------ | --------------------------- | --------------------------- | -------------------------------------------------- |
| `API_BASE_URL`           | URL base da API             | `http://localhost:7071/api` | `https://amigo-do-saber-api.azurewebsites.net/api` |
| `REQUEST_TIMEOUT`        | Timeout de requisições (ms) | `30000`                     | `30000`                                            |
| `AUTH.TOKEN_KEY`         | Chave localStorage token    | `authToken`                 | `authToken`                                        |
| `AUTH.USER_KEY`          | Chave localStorage user     | `user`                      | `user`                                             |
| `AUTH.TOKEN_EXPIRY_DAYS` | Dias até expirar token      | `7`                         | `7`                                                |

## 🔧 Como Configurar

### 1. Desenvolvimento Local

#### Backend

```powershell
# Copiar arquivo de exemplo
Copy-Item backend/local.settings.example.json backend/local.settings.json

# Editar com seus valores
code backend/local.settings.json
```

#### Frontend

```powershell
# Editar config
code frontend/js/config.js

# Garantir que está usando localhost
# API_BASE_URL: 'http://localhost:7071/api'
```

### 2. Produção (Azure)

#### Azure Functions (via Portal)

```powershell
# Configurar todas as variáveis
az functionapp config appsettings set `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --settings `
    "COSMOS_ENDPOINT=https://..." `
    "COSMOS_KEY=..." `
    "OPENAI_API_KEY=..." `
    "OPENAI_ENDPOINT=https://..." `
    "JWT_SECRET=..."
```

#### Ou via script (recomendado)

```powershell
# Já configurado automaticamente pelo setup-azure.ps1
.\scripts\setup-azure.ps1
```

#### Static Web App

```javascript
// frontend/js/config.js
const CONFIG = {
  API_BASE_URL: "https://amigo-do-saber-api.azurewebsites.net/api",
  // ...
}
```

## 🔑 Gerando Valores Seguros

### JWT Secret (32+ caracteres)

```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Bash
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 📊 Obter Credenciais do Azure

### Cosmos DB

```powershell
# Endpoint
az cosmosdb show `
  --name amigo-do-saber-db `
  --resource-group amigo-do-saber-rg `
  --query "documentEndpoint" -o tsv

# Primary Key
az cosmosdb keys list `
  --name amigo-do-saber-db `
  --resource-group amigo-do-saber-rg `
  --query "primaryMasterKey" -o tsv

# Connection String completa
az cosmosdb keys list `
  --name amigo-do-saber-db `
  --resource-group amigo-do-saber-rg `
  --type connection-strings `
  --query "connectionStrings[0].connectionString" -o tsv
```

### Azure OpenAI

```powershell
# Endpoint
az cognitiveservices account show `
  --name amigo-do-saber-openai `
  --resource-group amigo-do-saber-rg `
  --query "properties.endpoint" -o tsv

# API Key
az cognitiveservices account keys list `
  --name amigo-do-saber-openai `
  --resource-group amigo-do-saber-rg `
  --query "key1" -o tsv

# Listar deployments
az cognitiveservices account deployment list `
  --name amigo-do-saber-openai `
  --resource-group amigo-do-saber-rg `
  --query "[].name" -o table
```

## 🔒 Segurança

### ⚠️ NUNCA COMMITAR

❌ **NÃO FAZER**:

- ✗ Commitar `local.settings.json` com valores reais
- ✗ Commitar chaves de API no código
- ✗ Expor secrets em logs
- ✗ Compartilhar credentials por email/chat

✅ **FAZER**:

- ✓ Usar `.gitignore` para excluir `local.settings.json`
- ✓ Usar Azure Key Vault para secrets (futuro)
- ✓ Rotacionar chaves periodicamente
- ✓ Usar variáveis de ambiente no CI/CD

### Verificar se secrets foram commitados

```powershell
# Procurar por possíveis secrets
git log --all --full-history --source -- backend/local.settings.json

# Se encontrar, ROTACIONE IMEDIATAMENTE as chaves!
```

### Rotacionar Chaves

#### Cosmos DB

```powershell
# Regenerar primary key
az cosmosdb keys regenerate `
  --name amigo-do-saber-db `
  --resource-group amigo-do-saber-rg `
  --key-kind primary

# Atualizar na Function App
az functionapp config appsettings set `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --settings "COSMOS_KEY=NOVA_KEY_AQUI"
```

#### OpenAI

```powershell
# Regenerar key
az cognitiveservices account keys regenerate `
  --name amigo-do-saber-openai `
  --resource-group amigo-do-saber-rg `
  --key-name key1

# Obter nova key
az cognitiveservices account keys list `
  --name amigo-do-saber-openai `
  --resource-group amigo-do-saber-rg `
  --query "key1" -o tsv
```

## 🧪 Validar Configuração

### Testar localmente

```powershell
# Iniciar Functions
cd backend
func start

# Em outro terminal, testar
$testUrl = "http://localhost:7071/api/gamificacao/test"
Invoke-WebRequest -Uri $testUrl -Method GET
```

### Testar em produção

```powershell
$testUrl = "https://amigo-do-saber-api.azurewebsites.net/api/gamificacao/test"
Invoke-WebRequest -Uri $testUrl -Method GET
```

## 📚 Referências

- [Azure Functions App Settings](https://docs.microsoft.com/azure/azure-functions/functions-app-settings)
- [Cosmos DB Keys](https://docs.microsoft.com/azure/cosmos-db/secure-access-to-data)
- [Azure OpenAI Authentication](https://docs.microsoft.com/azure/cognitive-services/openai/how-to/authentication)
- [JWT Best Practices](https://jwt.io/introduction)

---

💡 **Dica**: Use o script `setup-azure.ps1` que configura tudo automaticamente!
