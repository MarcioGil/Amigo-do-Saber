# 🚀 Guia de Início Rápido - Amigo do Saber

Este guia leva você do zero ao deploy em **15 minutos**.

## ⚡ 3 Passos para o Deploy

### 1️⃣ Preparar Ambiente (2 minutos)

```powershell
# Verificar se Azure CLI está instalado
az --version

# Se não estiver, instalar
winget install -e --id Microsoft.AzureCLI

# Login no Azure
az login

# Clonar repositório
git clone https://github.com/SEU_USUARIO/Amigo-do-Saber.git
cd Amigo-do-Saber
```

### 2️⃣ Setup Azure (10 minutos)

```powershell
# Execute o script de setup automatizado
.\scripts\setup-azure.ps1
```

O script irá:

- ✅ Criar Resource Group
- ✅ Criar Cosmos DB (Free Tier)
- ✅ Criar 4 containers (Alunos, Progresso, Gamificacao, LogsDeUso)
- ✅ Criar Azure OpenAI com GPT-4
- ✅ Criar Function App
- ✅ Configurar todas as variáveis de ambiente
- ✅ Gerar arquivo `local.settings.json`

**Importante**: Copie e guarde as credenciais mostradas no final!

### 3️⃣ Deploy (3 minutos)

```powershell
# Fazer deploy do backend
.\scripts\deploy.ps1

# Configurar GitHub Actions
# 1. Vá em: https://github.com/SEU_USUARIO/Amigo-do-Saber/settings/secrets/actions
# 2. Adicione os seguintes secrets:

# AZURE_FUNCTIONAPP_PUBLISH_PROFILE
az functionapp deployment list-publishing-profiles `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --xml

# AZURE_STATIC_WEB_APPS_API_TOKEN
az staticwebapp secrets list `
  --name amigo-do-saber `
  --resource-group amigo-do-saber-rg `
  --query "properties.apiKey" -o tsv

# Fazer push para disparar deploy automático
git add .
git commit -m "Initial deployment to Azure"
git push origin main
```

## ✅ Verificar Deploy

### Backend (API)

```powershell
# Testar endpoint de cadastro
$body = @{
  responsavel = @{
    nome = "Teste Inicial"
    email = "teste@amigodosaber.com"
    telefone = "21999999999"
    senha = "Teste123!"
    parentesco = "pai"
  }
  aluno = @{
    nome = "Aluno Teste"
    dataNascimento = "2014-01-01"
    serie = "4º ano"
    materias = @("Matemática")
  }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod `
  -Uri "https://amigo-do-saber-api.azurewebsites.net/api/cadastro" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Frontend

Acesse: https://amigo-do-saber.azurestaticapps.net

Teste:

- ✅ Página inicial carrega
- ✅ Login funciona
- ✅ Cadastro de aluno
- ✅ Chat com Tia Dora
- ✅ Jogos são jogáveis

## 🐛 Troubleshooting Rápido

### Erro: "Azure CLI not found"

```powershell
winget install -e --id Microsoft.AzureCLI
# Reinicie o PowerShell
```

### Erro: "Free tier already used"

Você já tem um Cosmos DB Free Tier em outra subscription. Soluções:

1. Use outra subscription
2. Delete o Cosmos DB antigo
3. Use Cosmos DB pago (mínimo ~$25/mês)

### Erro: "Function App não responde"

```powershell
# Aguarde 2-3 minutos para inicialização
# Reinicie a Function App
az functionapp restart `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg

# Ver logs
func azure functionapp logstream amigo-do-saber-api
```

### Erro: "CORS blocked"

```powershell
# Adicionar origem permitida
az functionapp cors add `
  --name amigo-do-saber-api `
  --resource-group amigo-do-saber-rg `
  --allowed-origins "https://amigo-do-saber.azurestaticapps.net"
```

## 📱 Testar Localmente

### Terminal 1 - Backend

```powershell
cd backend
npm install
func start
```

### Terminal 2 - Frontend

```powershell
cd frontend
npx http-server -p 8080
```

Acesse: http://localhost:8080

## 💰 Custo Estimado

**Com Free Tier:**

- Cosmos DB: **R$ 0** (até 1000 RU/s + 25GB)
- Azure Functions: **R$ 0** (até 1M execuções/mês)
- Static Web Apps: **R$ 0** (até 100GB bandwidth/mês)
- Azure OpenAI: **~R$ 50-150/mês** (varia com uso)

**Total estimado: R$ 50-150/mês** (principalmente OpenAI)

### Reduzir Custos OpenAI

1. Limite de 50 perguntas/hora por aluno
2. Cache respostas comuns
3. Use GPT-3.5-turbo para perguntas simples
4. Implemente retry com backoff

## 📊 URLs Importantes

| Recurso        | URL                                                                                |
| -------------- | ---------------------------------------------------------------------------------- |
| Frontend       | https://amigo-do-saber.azurestaticapps.net                                         |
| API            | https://amigo-do-saber-api.azurewebsites.net                                       |
| Portal Azure   | https://portal.azure.com                                                           |
| GitHub Actions | https://github.com/SEU_USUARIO/Amigo-do-Saber/actions                              |
| Cosmos DB      | https://portal.azure.com → Resource Groups → amigo-do-saber-rg → amigo-do-saber-db |

## 🎯 Próximos Passos

Após deploy bem-sucedido:

1. **Teste completo da aplicação**

   - Cadastre um aluno
   - Faça perguntas para Tia Dora
   - Jogue os 3 jogos
   - Verifique gamificação

2. **Configure monitoramento**

   - Application Insights
   - Alertas de custo
   - Métricas de uso

3. **Adicione features**

   - Mais jogos educativos
   - Sistema de notificações
   - Dashboard para professores
   - Relatórios em PDF

4. **Otimize performance**

   - Cache de respostas
   - CDN para assets
   - Compression de arquivos

5. **Segurança**
   - Azure AD B2C para autenticação
   - Key Vault para secrets
   - WAF para proteção

## 📚 Documentação Completa

- **Deploy Detalhado**: [docs/DEPLOY_AZURE.md](../docs/DEPLOY_AZURE.md)
- **Configuração CI/CD**: [docs/DEPLOY_CONFIG.md](../docs/DEPLOY_CONFIG.md)
- **Estrutura de Dados**: [docs/ESTRUTURA_DADOS.md](../docs/ESTRUTURA_DADOS.md)
- **Tia Dora (IA)**: [docs/PROFESSORA_VIRTUAL.md](../docs/PROFESSORA_VIRTUAL.md)
- **Acessibilidade**: [docs/ACESSIBILIDADE.md](../docs/ACESSIBILIDADE.md)
- **Segurança**: [docs/SEGURANCA.md](../docs/SEGURANCA.md)

## 🆘 Suporte

Encontrou algum problema?

1. Verifique [Troubleshooting](#-troubleshooting-rápido) acima
2. Consulte [docs/DEPLOY_AZURE.md](../docs/DEPLOY_AZURE.md)
3. Abra uma issue no GitHub
4. Entre em contato com a equipe

## 🎉 Parabéns!

Você acaba de colocar no ar uma plataforma educacional completa que vai ajudar centenas de crianças na Baixada a terem acesso a educação de qualidade!

**Compartilhe com escolas e comunidades:**

- 🌐 Website: https://amigo-do-saber.azurestaticapps.net
- 📧 Email: contato@amigodosaber.com.br
- 📱 WhatsApp: (21) 99999-9999

---

💙 **Amigo do Saber** - Democratizando o acesso à educação de qualidade
