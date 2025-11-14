# 🚀 Backend - Azure Functions

Backend serverless da plataforma Amigo do Saber.

## 📋 Pré-requisitos

- Node.js 18+
- Azure Functions Core Tools 4.x
- Conta Azure configurada

## 🛠️ Instalação Local

```bash
# Instalar dependências
npm install

# Copiar configurações
cp local.settings.json.example local.settings.json

# Editar local.settings.json com suas credenciais

# Rodar localmente
npm start
```

O backend estará disponível em `http://localhost:7071`

## 📁 Estrutura

```
backend/
├── CadastroResponsavel/     # API: Cadastro de responsável e aluno
├── AtualizarProgresso/       # API: Atualizar progresso do aluno
├── PerguntarProfessora/      # API: Chat com professora virtual
├── ConsultarBot/             # API: Interação com bot conselheiro
├── GerarExercicio/           # API: Gerar exercícios personalizados
├── CalcularGamificacao/      # API: Processar pontos e badges
├── shared/                   # Código compartilhado
│   ├── cosmosClient.js       # Cliente Cosmos DB
│   ├── openaiClient.js       # Cliente Azure OpenAI
│   ├── contentSafety.js      # Moderação de conteúdo
│   └── middleware.js         # Validação, auth, etc
├── package.json
├── host.json
└── local.settings.json
```

## 🔧 Configuração

### Variáveis de Ambiente

Edite `local.settings.json`:

```json
{
  "Values": {
    "COSMOS_ENDPOINT": "sua-url",
    "COSMOS_KEY": "sua-chave",
    "AZURE_OPENAI_ENDPOINT": "sua-url",
    "AZURE_OPENAI_KEY": "sua-chave",
    ...
  }
}
```

### Azure Key Vault (Produção)

Para produção, use Azure Key Vault:

```javascript
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

const client = new SecretClient(
  "https://kv-amigodosaber.vault.azure.net",
  new DefaultAzureCredential()
);

const secret = await client.getSecret("CosmosDBKey");
```

## 🧪 Testes

```bash
npm test
```

## 🚀 Deploy

```bash
# Via VS Code: Clique com botão direito e "Deploy to Function App"

# Ou via CLI:
npm run deploy
```

## 📚 APIs Disponíveis

### POST /api/CadastroResponsavel
Cadastra responsável e aluno.

**Body:**
```json
{
  "responsavel": {
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "telefone": "+55 21 98765-4321"
  },
  "aluno": {
    "nome": "João Silva",
    "dataNascimento": "2015-03-15",
    "serie": "5º Ano",
    "materias": ["Matemática", "Português"]
  }
}
```

### POST /api/PerguntarProfessora
Envia pergunta para a professora virtual.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "alunoId": "uuid",
  "pergunta": "Como resolver frações?",
  "contexto": {
    "materia": "Matemática",
    "topico": "Frações"
  }
}
```

### GET /api/Progresso/{alunoId}
Busca progresso do aluno.

**Response:**
```json
{
  "aluno": {...},
  "progresso": [...],
  "gamificacao": {...}
}
```

## 🔒 Segurança

- Todas as APIs requerem autenticação JWT
- Rate limiting implementado
- Validação de input com Joi
- Content Safety para moderação
- CORS configurado para domínios específicos

## 📊 Monitoramento

Logs e métricas no Azure Application Insights:
- Performance de APIs
- Erros e exceções
- Uso de recursos
- Comportamento de usuários

## 🆘 Troubleshooting

### Erro: Cannot connect to Cosmos DB
✅ Verifique COSMOS_ENDPOINT e COSMOS_KEY no local.settings.json

### Erro: OpenAI quota exceeded
✅ Verifique seu plano Azure OpenAI ou use GPT-3.5-Turbo

### Functions não aparecem no portal
✅ Verifique se fez deploy para o Function App correto

---

**Dúvidas?** Consulte a [documentação completa](../docs/API.md)
