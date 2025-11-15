# Checklist de Deploy - Amigo do Saber

Use este checklist para garantir que todos os passos do deploy foram executados corretamente.

## 📋 Pré-Deploy

### Ambiente Local

- [ ] Azure CLI instalado e funcionando
- [ ] Node.js 18+ instalado
- [ ] Git configurado
- [ ] VS Code instalado (opcional, mas recomendado)
- [ ] Conta no Azure ativa
- [ ] Conta no GitHub ativa

### Repositório

- [ ] Código clonado localmente
- [ ] Repositório criado no GitHub
- [ ] Branch `main` como padrão
- [ ] README.md revisado

## 🔧 Setup Azure

### Resource Group

- [ ] Resource Group criado: `amigo-do-saber-rg`
- [ ] Região: `brazilsouth` (São Paulo)

### Cosmos DB

- [ ] Conta Cosmos DB criada: `amigo-do-saber-db`
- [ ] Free Tier habilitado
- [ ] Database criado: `amigo-saber-data`
- [ ] Container `Alunos` criado (partition key: `/id`)
- [ ] Container `Progresso` criado (partition key: `/alunoId`)
- [ ] Container `Gamificacao` criado (partition key: `/alunoId`)
- [ ] Container `LogsDeUso` criado (partition key: `/alunoId`)
- [ ] Connection string copiada e guardada
- [ ] Primary key copiada e guardada

### Azure OpenAI

- [ ] Serviço OpenAI criado: `amigo-do-saber-openai`
- [ ] Região: `eastus` (OpenAI não disponível em Brazil)
- [ ] Modelo GPT-4 deployado
- [ ] Deployment name: `gpt-4`
- [ ] API key copiada e guardada
- [ ] Endpoint copiado e guardado

### Azure Functions

- [ ] Storage Account criado
- [ ] Function App criado: `amigo-do-saber-api`
- [ ] Runtime: Node.js 18
- [ ] Região: `brazilsouth`
- [ ] Variáveis de ambiente configuradas:
  - [ ] `COSMOS_ENDPOINT`
  - [ ] `COSMOS_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `OPENAI_ENDPOINT`
  - [ ] `OPENAI_DEPLOYMENT_NAME`
  - [ ] `JWT_SECRET`

### Azure Static Web Apps

- [ ] Static Web App criado: `amigo-do-saber`
- [ ] Região: `brazilsouth`
- [ ] Conectado ao repositório GitHub
- [ ] Branch: `main`
- [ ] App location: `/frontend`
- [ ] Deployment token copiado

## 📝 Configuração Local

### Backend

- [ ] Arquivo `backend/local.settings.json` criado
- [ ] Todas as variáveis de ambiente preenchidas
- [ ] `npm install` executado em `backend/`
- [ ] `func start` executa sem erros
- [ ] Endpoints acessíveis em `http://localhost:7071/api`

### Frontend

- [ ] Arquivo `frontend/js/config.js` atualizado com URL da API
- [ ] Frontend abre sem erros no navegador
- [ ] Console não mostra erros críticos

### Git

- [ ] Arquivo `.gitignore` configurado
- [ ] `local.settings.json` NÃO commitado (verificar!)
- [ ] Secrets NÃO commitados (verificar!)

## 🚀 Deploy

### Backend (Azure Functions)

- [ ] `func azure functionapp publish amigo-do-saber-api` executado
- [ ] Deploy concluído sem erros
- [ ] Endpoints acessíveis em `https://amigo-do-saber-api.azurewebsites.net/api`
- [ ] Teste de endpoint de cadastro bem-sucedido
- [ ] Teste de endpoint de Tia Dora bem-sucedido
- [ ] Logs não mostram erros críticos

### Frontend (Static Web App)

- [ ] GitHub Actions configurado
- [ ] Secret `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` adicionado
- [ ] Secret `AZURE_STATIC_WEB_APPS_API_TOKEN` adicionado
- [ ] Push para branch `main` feito
- [ ] GitHub Actions executado com sucesso
- [ ] Frontend acessível em `https://amigo-do-saber.azurestaticapps.net`

### CORS

- [ ] CORS configurado na Function App
- [ ] Origem permitida: `https://amigo-do-saber.azurestaticapps.net`
- [ ] Teste de requisição do frontend para backend bem-sucedido

## 🧪 Testes

### Testes Funcionais

- [ ] **Página inicial** carrega corretamente
- [ ] **Login** funciona
- [ ] **Cadastro** de responsável e aluno funciona
- [ ] **Dashboard** mostra dados do aluno
- [ ] **Student Area** mostra missões e gamificação
- [ ] **Tia Dora** responde perguntas
- [ ] **Quiz de Matemática** é jogável
- [ ] **Jogo da Memória** funciona
- [ ] **Caça-Palavras** funciona
- [ ] **Gamificação** atualiza pontos e badges

### Testes de Integração

- [ ] Frontend → Backend (cadastro)
- [ ] Backend → Cosmos DB (salvar dados)
- [ ] Backend → OpenAI (Tia Dora)
- [ ] Frontend → Backend → Cosmos DB (carregar progresso)
- [ ] Autenticação JWT funciona

### Testes de Performance

- [ ] Tempo de resposta da API < 2s
- [ ] Tempo de carregamento do frontend < 3s
- [ ] Tia Dora responde em < 5s

### Testes de Segurança

- [ ] JWT expiração funciona
- [ ] Rate limiting da Tia Dora funciona (50/hora)
- [ ] HTTPS habilitado
- [ ] Secrets não expostos no código

## 📊 Monitoramento

### Application Insights

- [ ] Application Insights habilitado na Function App
- [ ] Métricas sendo coletadas
- [ ] Logs visíveis no portal

### Alertas

- [ ] Alerta de custo configurado (opcional)
- [ ] Alerta de erro 5xx configurado (opcional)
- [ ] Alerta de latência configurado (opcional)

### Logs

- [ ] `func azure functionapp logstream` funciona
- [ ] Logs do Cosmos DB acessíveis
- [ ] Logs do OpenAI acessíveis (uso de tokens)

## 📚 Documentação

### Arquivos Criados

- [ ] `docs/DEPLOY_AZURE.md` revisado
- [ ] `docs/DEPLOY_CONFIG.md` revisado
- [ ] `docs/QUICK_START.md` revisado
- [ ] `README.md` atualizado
- [ ] `ROADMAP.md` atualizado

### Secrets Documentados

- [ ] Connection strings guardadas em local seguro
- [ ] API keys guardadas em local seguro
- [ ] JWT secret guardado em local seguro
- [ ] Deployment tokens guardados em local seguro

**⚠️ IMPORTANTE**: NUNCA commite secrets no Git!

## 💰 Custos

### Verificações Finais

- [ ] Cosmos DB usando Free Tier (1000 RU/s)
- [ ] Function App em Consumption Plan
- [ ] Static Web App em Free Plan
- [ ] OpenAI dentro da cota esperada
- [ ] Alerta de custo configurado no Azure

### Estimativa Mensal

- Cosmos DB: **R$ 0** (Free Tier)
- Azure Functions: **R$ 0** (< 1M execuções)
- Static Web Apps: **R$ 0** (< 100GB bandwidth)
- Azure OpenAI: **R$ 50-150** (varia com uso)

**Total esperado: R$ 50-150/mês**

## 🎉 Conclusão

### Validação Final

- [ ] Todos os itens acima foram checados
- [ ] Aplicação está funcionando em produção
- [ ] URLs acessíveis publicamente
- [ ] Custos dentro do esperado
- [ ] Documentação completa

### URLs de Produção

```
Frontend: https://amigo-do-saber.azurestaticapps.net
API: https://amigo-do-saber-api.azurewebsites.net/api
Portal Azure: https://portal.azure.com
GitHub: https://github.com/SEU_USUARIO/Amigo-do-Saber
```

### Credenciais (guardadas com segurança)

```
Cosmos DB Endpoint: [GUARDADO]
Cosmos DB Key: [GUARDADO]
OpenAI Endpoint: [GUARDADO]
OpenAI Key: [GUARDADO]
JWT Secret: [GUARDADO]
Static Web App Token: [GUARDADO]
```

---

## ✅ Deploy Concluído com Sucesso!

**Data do deploy**: **_/_**/**\_**  
**Responsável**: ********\_\_\_********  
**Notas adicionais**:

```
[Espaço para anotações]
```

---

💙 **Amigo do Saber** - Sua plataforma educacional está no ar!
