# Configuração de Deploy - Amigo do Saber

Este documento descreve a configuração de deployment para Azure.

## 📁 Arquivos de Configuração

### 1. `.github/workflows/azure-deploy.yml`

GitHub Actions workflow para CI/CD automático.

**Triggers:**

- Push para branch `main`
- Pull requests para `main`
- Execução manual (workflow_dispatch)

**Jobs:**

- `build-and-deploy-backend`: Faz build e deploy das Azure Functions
- `build-and-deploy-frontend`: Faz deploy do Static Web App
- `notify-success`: Notifica sucesso do deploy

### 2. `staticwebapp.config.json`

Configuração do Azure Static Web Apps.

**Recursos:**

- Skip build (frontend é estático)
- Rotas SPA (fallback para index.html)
- Headers de segurança
- Cache para assets
- Mime types

### 3. `scripts/setup-azure.ps1`

Script PowerShell para setup inicial do Azure.

**O que faz:**

- ✅ Cria Resource Group
- ✅ Cria Cosmos DB (Free Tier)
- ✅ Cria 4 containers
- ✅ Cria Azure OpenAI Service
- ✅ Faz deploy do modelo GPT-4
- ✅ Cria Function App
- ✅ Configura variáveis de ambiente
- ✅ Gera `local.settings.json`

**Uso:**

```powershell
.\scripts\setup-azure.ps1
```

### 4. `scripts/deploy.ps1`

Script para deploy rápido após setup inicial.

**O que faz:**

- Instala dependências do backend
- Faz deploy para Azure Functions
- Testa endpoint de saúde
- Mostra instruções para frontend

**Uso:**

```powershell
.\scripts\deploy.ps1
```

## 🔑 Secrets do GitHub

Configure estes secrets no seu repositório GitHub (Settings → Secrets and variables → Actions):

### AZURE_FUNCTIONAPP_PUBLISH_PROFILE

Obtenha o publish profile:

```powershell
az functionapp deployment list-publishing-profiles `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --xml
```

Copie todo o XML e adicione como secret.

### AZURE_STATIC_WEB_APPS_API_TOKEN

Obtenha o deployment token:

```powershell
az staticwebapp secrets list `
  --name amigo-do-saber `
  --resource-group amigo-do-saber-rg `
  --query "properties.apiKey" -o tsv
```

## 🚀 Fluxo de Deploy

### Deploy Inicial (Setup)

1. **Execute o setup do Azure:**

   ```powershell
   .\scripts\setup-azure.ps1
   ```

2. **Configure secrets no GitHub:**

   - Adicione `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`
   - Adicione `AZURE_STATIC_WEB_APPS_API_TOKEN`

3. **Faça o primeiro deploy:**

   ```powershell
   .\scripts\deploy.ps1
   ```

4. **Faça push para GitHub:**
   ```powershell
   git add .
   git commit -m "Initial Azure deployment"
   git push origin main
   ```

### Deploy Contínuo

Após o setup inicial, qualquer push para `main` dispara deploy automático:

```powershell
# Fazer alterações no código
git add .
git commit -m "Sua mensagem de commit"
git push origin main
```

O GitHub Actions:

1. Faz build do backend
2. Deploy para Azure Functions
3. Deploy do frontend para Static Web App
4. Notifica sucesso

## 🧪 Testar Deploy

### Backend (Azure Functions)

```powershell
# Testar endpoint de cadastro
$body = @{
  responsavel = @{
    nome = "Teste Deploy"
    email = "teste@deploy.com"
    telefone = "11999999999"
    senha = "Teste123!"
    parentesco = "pai"
  }
  aluno = @{
    nome = "Aluno Teste"
    dataNascimento = "2015-01-01"
    serie = "3º ano"
    materias = @("Matemática", "Português")
  }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod `
  -Uri "https://amigo-do-saber-api.azurewebsites.net/api/cadastro" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Frontend (Static Web App)

Acesse: https://amigo-do-saber.azurestaticapps.net

Teste:

1. ✅ Página inicial carrega
2. ✅ Login/cadastro funciona
3. ✅ Dashboard carrega após login
4. ✅ Tia Dora responde perguntas
5. ✅ Jogos são jogáveis
6. ✅ Gamificação atualiza

## 📊 Monitoramento

### Logs em tempo real

```powershell
# Functions
func azure functionapp logstream amigo-do-saber-api

# Via Azure CLI
az webapp log tail --name amigo-do-saber-api --resource-group amigo-do-saber-rg
```

### Application Insights

Acesse no Portal Azure:

1. Resource Group → amigo-do-saber-rg
2. Function App → amigo-do-saber-api
3. Application Insights
4. Ver métricas, logs e traces

## 🔧 Troubleshooting

### Deploy falha com "401 Unauthorized"

**Solução:** Regenere o publish profile e atualize o secret no GitHub.

```powershell
az functionapp deployment list-publishing-profiles `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --xml
```

### Frontend não encontra API

**Solução:** Verifique CORS na Function App.

```powershell
az functionapp cors add `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --allowed-origins "https://amigo-do-saber.azurestaticapps.net"
```

### Cosmos DB retorna erro 429 (Too Many Requests)

**Solução:** Aumente o throughput temporariamente.

```powershell
az cosmosdb sql container throughput update `
  --account-name amigo-do-saber-db `
  --database-name amigo-saber-data `
  --name Alunos `
  --resource-group amigo-do-saber-rg `
  --throughput 1000
```

### OpenAI retorna erro 403 ou 429

**Verificar:**

- Cota de tokens não excedida
- Chave API válida
- Modelo deployado corretamente

```powershell
# Listar deployments
az cognitiveservices account deployment list `
  --name amigo-do-saber-openai `
  --resource-group amigo-do-saber-rg
```

## 💰 Otimização de Custos

### Free Tier Limits

- **Cosmos DB**: 1000 RU/s + 25GB (grátis)
- **Functions**: 1M execuções/mês (grátis)
- **Static Web Apps**: 100GB bandwidth/mês (grátis)
- **OpenAI**: Pago por uso (~$0.03/1K tokens)

### Reduzir Custos OpenAI

1. **Cache de respostas comuns**
2. **Limite de perguntas por usuário**
3. **Use GPT-3.5-turbo para perguntas simples**
4. **Implemente retry com backoff**

## 🔄 Rollback

Se algo der errado após deploy:

### Via Portal Azure

1. Function App → Deployment Center
2. Selecione deployment anterior
3. Clique em "Redeploy"

### Via GitHub

1. Reverta o commit:

   ```powershell
   git revert HEAD
   git push origin main
   ```

2. Ou faça deploy de versão específica:
   ```powershell
   git checkout <commit-hash>
   .\scripts\deploy.ps1
   ```

## 📈 Próximos Passos

1. **Setup Application Insights** para monitoramento avançado
2. **Configurar alertas** de custo e performance
3. **Implementar Azure Key Vault** para secrets
4. **Adicionar testes automatizados** no CI/CD
5. **Configurar staging environment**
6. **Implementar backup automático** do Cosmos DB

## 📚 Referências

- [Azure Functions CI/CD](https://docs.microsoft.com/azure/azure-functions/functions-continuous-deployment)
- [Static Web Apps Deployment](https://docs.microsoft.com/azure/static-web-apps/deployment-strategies)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [Cosmos DB Best Practices](https://docs.microsoft.com/azure/cosmos-db/performance-tips)
