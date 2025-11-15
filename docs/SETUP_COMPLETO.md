# 📘 Setup Completo - Amigo do Saber

## Guia Passo a Passo para Deploy no Azure (Custo Zero)

Este guia vai te levar do zero até ter sua plataforma funcionando no Azure, usando apenas recursos gratuitos.

---

## 📋 Checklist de Pré-requisitos

Antes de começar, certifique-se de ter:

- [ ] VS Code instalado
- [ ] Git instalado
- [ ] Node.js 18+ ou Python 3.9+ instalado
- [ ] Conta Azure criada (Azure Free Account)
- [ ] Extensões do VS Code instaladas (ver README)

---

## FASE 1: Fundação de Dados e Estrutura 🏗️

### 1.1 Login no Azure pelo VS Code

1. Abra o VS Code
2. Na barra lateral, clique no ícone do Azure (nuvem azul)
3. Clique em **"Sign in to Azure"**
4. Faça login no navegador que abrir
5. Volte ao VS Code - você verá suas assinaturas

### 1.2 Configuração do Repositório

```bash
# Já está feito! Mas para referência:
git init
git add .
git commit -m "Initial commit: Estrutura do projeto"
git remote add origin https://github.com/MarcioGil/Amigo-do-Saber.git
git push -u origin main
```

### 1.3 Criar Azure Cosmos DB (Free Tier) ⭐ IMPORTANTE

**Opção A: Pelo Portal Azure (Recomendado para iniciantes)**

1. Acesse [Portal do Azure](https://portal.azure.com)
2. Clique em **"Criar um recurso"**
3. Procure por **"Azure Cosmos DB"**
4. Clique em **"Criar"**
5. Configure:
   - **Subscription**: Sua assinatura gratuita
   - **Resource Group**: Criar novo → `rg-amigodosaber`
   - **Account Name**: `cosmos-amigodosaber` (deve ser único)
   - **API**: Selecione **"Core (SQL)"** ou **"NoSQL"**
   - **Location**: `Brazil South` (mais próximo)
   - **Capacity mode**: **Serverless** (importante para Free Tier)
   - **Apply Free Tier Discount**: ✅ **ATIVE ESTA OPÇÃO**
6. Clique em **"Review + create"**
7. Clique em **"Create"**
8. Aguarde ~5 minutos para provisionar

**Opção B: Pelo VS Code (Rápido)**

1. No VS Code, aba Azure
2. Seção **Databases**
3. Clique no **+** ao lado de Cosmos DB
4. Siga o assistente:
   - Selecione **"Core (SQL)"**
   - Nome da conta: `cosmos-amigodosaber`
   - Resource Group: `rg-amigodosaber`
   - Location: `Brazil South`
   - Capacidade: **Serverless**

### 1.4 Criar Banco e Contêineres

**No Portal Azure:**

1. Vá para seu recurso Cosmos DB criado
2. Clique em **"Data Explorer"** no menu lateral
3. Clique em **"New Database"**
   - Database ID: `EduDB`
   - Throughput: **Serverless** (sem RU/s manual)
4. Crie os contêineres:

**Contêiner 1: Alunos**

- Clique em **"New Container"**
- Database ID: `EduDB` (use existing)
- Container ID: `Alunos`
- Partition key: `/id`

**Contêiner 2: Progresso**

- Container ID: `Progresso`
- Partition key: `/alunoId`

**Contêiner 3: Gamificacao**

- Container ID: `Gamificacao`
- Partition key: `/alunoId`

**Contêiner 4: LogsDeUso**

- Container ID: `LogsDeUso`
- Partition key: `/alunoId`

### 1.5 Copiar Chaves de Conexão

1. No seu Cosmos DB, vá em **"Keys"** (menu lateral)
2. Copie:
   - **URI**
   - **PRIMARY KEY**
3. Salve em um local seguro (vamos usar depois)

---

## FASE 2: Hospedagem Frontend e CI/CD 🚀

### 2.1 Criar Azure Static Web App

**Pelo VS Code (Mais Fácil):**

1. Na aba Azure, seção **Static Web Apps**
2. Clique no **+** para criar novo
3. Siga o assistente:
   - **Nome**: `amigo-do-saber`
   - **Região**: `Central US` (Free)
   - **Build Preset**: `Custom`
   - **App location**: `/frontend`
   - **API location**: (deixe vazio por enquanto)
   - **Output location**: `/`
4. Selecione seu repositório GitHub: `Amigo-do-Saber`
5. Autorize o GitHub Actions

### 2.2 O que Aconteceu?

- O Azure criou um arquivo `.github/workflows/azure-static-web-apps-*.yml`
- Este arquivo faz deploy automático toda vez que você fizer push
- Você recebeu uma URL pública (ex: `https://amigo-do-saber.azurestaticapps.net`)

### 2.3 Testar o Deploy

```bash
git add .
git commit -m "Setup inicial frontend"
git push
```

- Vá para a aba **Actions** no GitHub
- Acompanhe o deploy
- Acesse a URL quando terminar

---

## FASE 3: Backend Serverless (Azure Functions) ⚙️

### 3.1 Criar Projeto Function App

1. No VS Code, aba Azure
2. Seção **Functions**
3. Clique no ícone de raio (Create Function)
4. Escolha:
   - **Linguagem**: JavaScript (ou Python)
   - **Template**: HTTP Trigger
   - **Nome**: `CadastroAluno`
   - **Authorization**: Function

### 3.2 Instalar Dependências do Cosmos DB

**Para Node.js:**

```bash
cd backend
npm init -y
npm install @azure/cosmos
npm install dotenv
```

**Para Python:**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install azure-cosmos
pip install azure-functions
```

### 3.3 Configurar Variáveis de Ambiente

1. Crie o arquivo `backend/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_ENDPOINT": "sua-uri-aqui",
    "COSMOS_KEY": "sua-chave-aqui",
    "COSMOS_DATABASE": "EduDB"
  }
}
```

2. Cole suas credenciais do Cosmos DB (da Fase 1.5)

### 3.4 Deploy do Backend

1. Clique com botão direito na pasta `backend`
2. Selecione **"Deploy to Function App"**
3. Escolha **"Create new Function App in Azure"**
4. Configure:
   - **Nome**: `func-amigodosaber`
   - **Runtime**: Node.js 18 (ou Python 3.9)
   - **Região**: Brazil South
   - **Hosting Plan**: **Consumption** (PAY-AS-YOU-GO = Free Tier)

### 3.5 Configurar Variáveis no Azure

1. No Portal Azure, vá para sua Function App
2. **Configuration** → **Application Settings**
3. Adicione as mesmas variáveis do `local.settings.json`
4. Salve

---

## FASE 4: Inteligência Artificial 🤖

### 4.1 Azure OpenAI (Professora Virtual)

⚠️ **IMPORTANTE**: Azure OpenAI requer aprovação. Alternativa: use OpenAI API diretamente (paga, mas ~$5 dura muito tempo).

**Aplicar para Azure OpenAI:**

1. [Formulário de Acesso](https://aka.ms/oai/access)
2. Aguarde aprovação (pode levar dias)

**Alternativa - OpenAI API:**

1. Crie conta em [OpenAI](https://platform.openai.com)
2. Copie sua API Key
3. Adicione no `local.settings.json`:

```json
"OPENAI_API_KEY": "sk-..."
```

### 4.2 Azure AI Language (Bot Conselheiro)

1. Portal Azure → **"Criar recurso"**
2. Procure **"Language Service"**
3. Crie:
   - Resource Group: `rg-amigodosaber`
   - Nome: `lang-amigodosaber`
   - Pricing Tier: **Free F0** (5K chamadas/mês grátis)
   - Região: Brazil South
4. Copie as chaves

### 4.3 Translator (Inglês)

1. Portal Azure → **"Criar recurso"**
2. Procure **"Translator"**
3. Crie:
   - Pricing Tier: **Free F0** (2M chars/mês)
4. Copie as chaves

---

## FASE 5: Segurança (Azure AD B2C) 🔒

### 5.1 Criar Tenant B2C

1. Portal Azure → **"Criar recurso"** → **"Azure AD B2C"**
2. **"Create a new Azure AD B2C Tenant"**
3. Configure:
   - Organization name: `AmigoDoSaber`
   - Initial domain: `amigodosaber.onmicrosoft.com`
   - País: Brasil
4. Crie

### 5.2 Registrar Aplicativo

1. Vá para o tenant B2C criado
2. **App registrations** → **New registration**
3. Configure:
   - Nome: `Amigo do Saber Web`
   - Supported account types: **Accounts in any identity provider or organizational directory**
   - Redirect URI: `https://amigo-do-saber.azurestaticapps.net/auth/callback`
4. Anote o **Application (client) ID**

### 5.3 Criar User Flows

1. No B2C, vá para **User flows**
2. Crie 2 flows:
   - **Sign up and sign in**: Para responsáveis
   - **Profile editing**: Para atualizar dados

---

## FASE 6: Integração e Testes 🧪

### 6.1 Atualizar Frontend para Chamar Backend

No `frontend/js/config.js`:

```javascript
const API_BASE_URL = "https://func-amigodosaber.azurewebsites.net/api"
const OPENAI_ENDPOINT = "..." // suas credenciais
```

### 6.2 Teste Local

```bash
# Terminal 1 - Backend
cd backend
func start

# Terminal 2 - Frontend (Live Server no VS Code)
# Ou abra frontend/index.html no navegador
```

### 6.3 Teste em Produção

1. Faça push das alterações
2. GitHub Actions fará deploy automático
3. Teste a URL pública

---

## FASE 7: Analytics (Power BI) 📊

### 7.1 Instalar Power BI Desktop

1. Baixe [Power BI Desktop](https://powerbi.microsoft.com/desktop/)
2. Instale

### 7.2 Conectar ao Cosmos DB

1. Abra Power BI Desktop
2. **Get Data** → **Azure** → **Azure Cosmos DB**
3. Cole seu endpoint do Cosmos DB
4. Autentique com a chave
5. Selecione os contêineres

### 7.3 Criar Visualizações

Crie dashboards para:

- Evolução de habilidades por matéria
- Engajamento diário/semanal
- Uso da Professora Virtual
- Progresso no sistema de gamificação

---

## ✅ Checklist Final

- [ ] Cosmos DB criado e populado
- [ ] Frontend online no Static Web Apps
- [ ] Backend Functions funcionando
- [ ] Azure OpenAI ou OpenAI API configurado
- [ ] Bot Conselheiro funcionando
- [ ] Autenticação B2C ativa
- [ ] Power BI Dashboard criado
- [ ] CI/CD funcionando (GitHub Actions)

---

## 🆘 Troubleshooting

### Erro: Cosmos DB está cobrando

✅ **Solução**: Verifique se está em **Serverless mode** e **Free Tier ativado**.

### Functions não estão executando

✅ **Solução**: Verifique as variáveis de ambiente no Azure Portal → Function App → Configuration.

### Frontend não carrega

✅ **Solução**: Verifique os logs no GitHub Actions e no Azure Static Web Apps.

---

## 📚 Próximos Passos

1. Implemente as funcionalidades do roadmap
2. Teste com usuários reais (família/amigos)
3. Itere baseado no feedback
4. Prepare o portfólio para recrutadores

---

**Dúvidas?** Consulte a documentação ou abra uma issue no GitHub!
