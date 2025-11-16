# 🖥️ Como acessar localmente

Se o deploy não funcionar, você pode apresentar o app localmente:

1. Instale o Node.js (https://nodejs.org/)
2. No terminal, execute:
  ```powershell
  cd frontend
  npx http-server -p 8081
  ```
3. Acesse no navegador: http://localhost:8081
4. Para ver a Tia Dora: http://localhost:8081/tia-dora.html

## Login demo para apresentação

Use estes dados na tela de login:
- **Usuário:** demo@amigo.com
- **Senha:** Demo123!

Assim você pode navegar e mostrar todas as funcionalidades do app mesmo sem deploy online.
# ✨ Melhorias Recentes (Nov/2025)

- Tia Dora agora é representada como uma mulher preta, trazendo mais inclusão e identificação para as crianças.
- Novo avatar ilustrativo adicionado ao frontend (`frontend/img/tia-dora-avatar.svg`).
- Texto de apresentação da Tia Dora atualizado para reforçar acolhimento e representatividade.
- Estilos visuais do chat ajustados para destacar o avatar e garantir acessibilidade.
- Automação do deploy do frontend via Azure Storage Static Website.
- Correção e validação do arquivo `staticwebapp.config.json`.
- Checklist de deploy atualizado e CI/CD validado.
# 🎓 Amigo do Saber
#
## 👩🏾‍🏫 Apresentação do Projeto

Este projeto foi idealizado e desenvolvido por **Marcio Gil** para democratizar o reforço escolar na Baixada.

### 🎥 Apresentação em vídeo
Você pode assistir à apresentação oficial do projeto com a própria Tia Dora em:
**[YouTube - Apresentação Amigo do Saber](https://www.youtube.com/@marciogil)**

### 📱 Links do autor
- [LinkedIn](https://www.linkedin.com/in/marciogil)
- [GitHub](https://github.com/MarcioGil)
- [Instagram](https://instagram.com/marciogil.dev)

### 👩🏾‍🏫 Avatar da Tia Dora
O avatar oficial está disponível em `frontend/img/tia-dora-avatar.svg` para uso em vídeos, apresentações e materiais.


**Plataforma educacional gratuita para reforço escolar personalizado na Baixada**

## 🎯 Missão

Democratizar o acesso à educação de qualidade, oferecendo reforço escolar personalizado, gamificação, jogos educativos e uma professora virtual que acompanha cada criança em sua jornada de aprendizado.

## ✨ Funcionalidades

### 📚 Para os Alunos

- **Reforço Escolar Personalizado**: Conteúdo adaptado à série e dificuldades específicas
- **Professora Virtual (IA)**: Explica conceitos, tira dúvidas e interage de forma amigável
- **Preparação para Provas**: Simulados e revisões focadas
- **Sistema de Gamificação**: Pontos, badges, níveis e missões diárias
- **Jogos Educativos**: Aprenda brincando com jogos de matemática, português e inglês
- **Aulas de Inglês**: Vocabulário, pronúncia e conversação básica
- **Bot Conselheiro**: Orientações sobre estudos, comportamento e segurança online

### 👨‍👩‍👧‍👦 Para os Responsáveis

- **Dashboard de Progresso**: Acompanhe o desempenho do seu filho em tempo real
- **Relatórios Personalizados**: Evolução por matéria e habilidade
- **Alertas Inteligentes**: Notificações sobre dificuldades detectadas
- **Gestão de Perfil**: Configure séries, matérias e livros didáticos

## 🔒 Segurança e Privacidade


### Segurança de Segredos

**Nunca exponha chaves ou senhas no código ou em commits!**

1. Use o arquivo `.env.example` como template e nunca suba `.env` real para o repositório.
2. Para verificar se há segredos acidentais no histórico, utilize:
  - **Windows:**
    - Instale o [truffleHog](https://github.com/trufflesecurity/trufflehog) via Python:
     ```powershell
     pip install trufflehog
     trufflehog filesystem .
     ```
  - **Mac/Linux:**
    - Instale o git-secrets:
     ```bash
     brew install git-secrets
     git secrets --install
     git secrets --scan
     ```
3. Use Azure Key Vault para armazenar segredos em produção.
  - No GitHub Actions, referencie segredos via `${{ secrets.AZURE_OPENAI_KEY }}`.

### Instruções para quem nunca usou Azure

1. Crie uma conta gratuita em https://portal.azure.com
2. Instale a [Azure CLI](https://docs.microsoft.com/pt-br/cli/azure/install-azure-cli)
3. Faça login:
  ```powershell
  az login
  ```
4. Para criar recursos básicos:
  ```powershell
  az group create --name AmigoDoSaberRG --location brazilsouth
  az storage account create --name amigodosaberstorage --resource-group AmigoDoSaberRG --location brazilsouth --sku Standard_LRS
  ```
5. Para usar Key Vault:
  ```powershell
  az keyvault create --name amigodosaber-vault --resource-group AmigoDoSaberRG --location brazilsouth
  az keyvault secret set --vault-name amigodosaber-vault --name AZURE_OPENAI_KEY --value <sua-chave>
  ```
6. Consulte a documentação oficial do Azure para mais detalhes.


- Nunca commit segredos reais (.env, chaves, tokens).
- Use `.env.example` como referência para variáveis.
- Configure Azure Key Vault ou GitHub Secrets para produção.
- No GitHub Actions, referencie segredos via `${{ secrets.AZURE_OPENAI_KEY }}`.
- Recomenda-se rodar `git secrets --scan` antes de cada commit.

## ♿ Acessibilidade
- Conformidade com WCAG 2.1 (nível AA)

## 🏗️ Arquitetura (Free Tier - Custo R$ 0)

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Azure SWA)                    │
│  HTML5 + CSS3 + JavaScript (Vanilla) - Deploy Automático   │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Azure Functions)                   │
│  • CadastroAluno     • AtualizarProgresso                   │
│  • Gamificacao       • AdaptarConteudo                      │
│  • GerarExercicios   • AnalisarDesempenho                   │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────┬──────────────────────────────────────┐
│  COSMOS DB (NoSQL)   │      AZURE AI SERVICES              │
│  • Alunos            │  • Azure OpenAI (Professora)        │
│  • Progresso         │  • AI Language (Bot Conselheiro)    │
│  • Gamificação       │  • Translator (Inglês)              │
│  • LogsDeUso         │  • Content Safety (Moderação)       │
└──────────────────────┴──────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              ANALYTICS (Power BI Desktop)                   │
│  Dashboard de Impacto Social + Métricas Educacionais       │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Azure Functions (Node.js/Python)
- **Banco de Dados**: Azure Cosmos DB (Free Tier)
- **IA**: Azure OpenAI + Azure AI Language + Translator
- **Autenticação**: Azure AD B2C
- **Hospedagem**: Azure Static Web Apps
**Hospedagem**: Azure Storage Static Website (frontend) + Azure Functions (backend)
- **CI/CD**: GitHub Actions
- **Analytics**: Power BI Desktop

## 📋 Pré-requisitos

- [VS Code](https://code.visualstudio.com/)
- [Node.js 18+](https://nodejs.org/) ou [Python 3.9+](https://www.python.org/)
- [Azure Free Account](https://azure.microsoft.com/free/)
- [Git](https://git-scm.com/)

### Extensões VS Code (Instalar)

# ✨ Resumo das Melhorias de Hoje (15/11/2025)

- Tia Dora agora é representada como uma mulher preta, com avatar ilustrativo e texto acolhedor.
- Menu horizontal estilizado e acessível adicionado ao topo das páginas principais, com links funcionais.
- Links do menu corrigidos para navegação entre Início, Tia Dora, Jogos, Área do Aluno e Login.
- Estilos visuais do chat e menu ajustados para acessibilidade e responsividade.
- Instruções de acesso local ao app incluídas no README.
- Login demo criado para facilitar testes e apresentação.
- Correção e validação do arquivo `staticwebapp.config.json`.
- Checklist de deploy atualizado e CI/CD validado.
- Automação do deploy do frontend via Azure Storage Static Website.
```bash
# Abra o VS Code e instale:
- Azure Tools (ms-vscode.vscode-node-azure-pack)
- Azure Functions
- Azure Databases
- Azure Static Web Apps
- GitHub Actions
```

## 🎬 Começando Rápido

### Opção 1: Setup Automatizado (Recomendado)

```powershell
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/Amigo-do-Saber.git
cd Amigo-do-Saber
.\scripts\setup-azure.ps1

# 3. Faça o deploy
.\scripts\deploy.ps1

# 4. Configure secrets no GitHub e faça push
git add .
git commit -m "Initial deployment"
git push origin main
```

✅ Pronto! Sua aplicação está no ar em ~15 minutos.

### Opção 2: Setup Manual

Siga o guia detalhado: [docs/DEPLOY_AZURE.md](docs/DEPLOY_AZURE.md)

## 💻 Desenvolvimento Local

### Backend (Azure Functions)

```powershell
cd backend
npm install
func start
```

API estará em: http://localhost:7071/api

### Frontend

```powershell
cd frontend
npx http-server -p 8080
```

Frontend estará em: http://localhost:8080

### Testar Tia Dora

```powershell
# POST para /api/tia-dora
$body = @{
  alunoId = "teste123"
  pergunta = "O que é fotossíntese?"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:7071/api/tia-dora" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

## 📦 Estrutura do Projeto

````
Amigo-do-Saber/
├── backend/                    # Azure Functions (API)
│   ├── CadastroResponsavel/   # Cadastro de usuários
│   ├── AtualizarProgresso/    # Tracking de progresso
│   ├── Gamificacao/           # Sistema de pontos e badges
│   ├── PerguntarProfessora/   # Tia Dora (IA)
│   └── shared/                # Utilitários compartilhados
├── frontend/                   # Interface do usuário
│   ├── css/                   # Estilos (2400+ linhas)
│   ├── js/                    # JavaScript (1600+ linhas)
│   ├── games/                 # Jogos educativos
│   └── *.html                 # Páginas principais
├── docs/                      # Documentação
│   ├── DEPLOY_AZURE.md       # Guia completo de deploy
│   ├── DEPLOY_CONFIG.md      # Configuração de CI/CD
│   ├── ESTRUTURA_DADOS.md    # Schema do Cosmos DB
│   ├── PROFESSORA_VIRTUAL.md # Tia Dora (IA)
│   └── ACESSIBILIDADE.md     # WCAG 2.1 AA
├── scripts/                   # Scripts de automação
│   ├── setup-azure.ps1       # Setup completo do Azure
│   └── deploy.ps1            # Deploy rápido
└── .github/workflows/         # CI/CD
    └── azure-deploy.yml      # GitHub Actions

## 🎮 Jogos Educativos

### 1. Quiz de Matemática
- 10 perguntas de múltipla escolha
- Timer de 5 minutos
- Pontuação com bônus de velocidade
- Feedback visual imediato

### 2. Jogo da Memória
- Conceitos científicos
- 3 níveis de dificuldade
- Animação 3D de flip
- Pontuação com bônus de eficiência

### 3. Caça-Palavras
- Vocabulário português
- Grid 10x10 com seleção por arrasto
- Sistema de dicas
- 8 palavras por jogo

### 4. Hub de Jogos
- Filtros por matéria
- Estatísticas do jogador
- Cards com dificuldade
- Integração com gamificação

## 🏆 Sistema de Gamificação

### Níveis (10 níveis)
- 🌱 Iniciante (0 pts)
- 📚 Estudante (100 pts)
- 🎓 Dedicado (500 pts)
- ⭐ Brilhante (1000 pts)
- 🏅 Mestre do Conhecimento (10000 pts)

### Badges (8 conquistas)
- 🧮 Matemático
- 📖 Leitor Assíduo
- 🔬 Cientista
- 📅 Dedicação Semanal/Mensal
- 💯 Perfeccionista
- 🦉 Coruja Noturna
- 🌅 Madrugador

### Missões Diárias
- 3 missões por dia
- Auto-geradas (exercícios, sequência, tempo)
- Pontos: 50-100 por missão
- Reset à meia-noite

### Streak
- Dias consecutivos estudando
- Bônus de multiplicador
- Melhor sequência registrada

## 🤖 Tia Dora - Professora Virtual

### Características
- **Persona**: Mulher preta, carinhosa, paciente e didática, inspirada na representatividade familiar brasileira
- **Visual**: Novo avatar ilustrativo no frontend, reforçando inclusão e acolhimento
- **Tom**: Amigável para crianças 6-14 anos
- **Método**: Exemplos do cotidiano (pizza para frações!)
- **Limite**: 50 perguntas/hora por aluno

### Tecnologia
- Modelo: GPT-4 (Azure OpenAI)
- Temperature: 0.7 (criatividade balanceada)
- Max tokens: 500 (respostas concisas)
- Context: Perfil do aluno + dificuldades + histórico

### Exemplos de Uso
```javascript
// Pergunta sobre matemática
"Tia Dora, como resolvo 2x + 5 = 15?"

// Explicação de conceitos
"O que são verbos?"

// Ajuda com lição de casa
"Não entendi fotossíntese, pode explicar?"
````

## 📊 Monitoramento

### Application Insights

```powershell
# Ver métricas em tempo real
az monitor app-insights metrics show `
  --app amigo-do-saber-api `
  --metric requests/count
```

### Logs

```powershell
# Stream de logs
func azure functionapp logstream amigo-do-saber-api
```

### Custos

```powershell
# Ver custos atuais
az consumption usage list `
  --resource-group amigo-do-saber-rg
```

## 🧪 Testes

### Testar Cadastro

```powershell
$body = @{
  responsavel = @{
    nome = "Maria Silva"
    email = "maria@exemplo.com"
    telefone = "21987654321"
    senha = "Senha123!"
    parentesco = "mãe"
  }
  aluno = @{
    nome = "João Silva"
    dataNascimento = "2014-05-15"
    serie = "4º ano"
    materias = @("Matemática", "Português", "Ciências")
    escola = "Escola Municipal da Baixada"
  }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod `
  -Uri "https://amigo-do-saber-api.azurewebsites.net/api/cadastro" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Testar Gamificação

````powershell
# Adicionar pontos
$body = @{
  pontos = 50
  materia = "Matemática"
  atividade = "Quiz completado"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://amigo-do-saber-api.azurewebsites.net/api/gamificacao/ALUNO_ID" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -Headers @{ "Authorization" = "Bearer SEU_TOKEN" }

1. **Clone o Repositório**
```bash
git clone https://github.com/MarcioGil/Amigo-do-Saber.git
cd Amigo-do-Saber
````

2. **Login no Azure pelo VS Code**

   - Clique no ícone do Azure na barra lateral
   - Clique em "Sign in to Azure"
   - Siga as instruções no navegador

3. **Configure o Cosmos DB**
   - Siga o guia em `docs/SETUP_COSMOSDB.md`

### Fase 2: Frontend

4. **Execute Localmente**

```bash
cd frontend
# Abra o index.html no navegador ou use Live Server do VS Code
```

### Fase 3: Backend

5. **Configure as Functions**

```bash
cd backend
npm install
# Copie .env.example para .env e configure suas chaves
func start
```

6. **Deploy**
   - Clique com botão direito no projeto Function App
   - Selecione "Deploy to Function App"
   - Escolha "Consumption Plan" (Free Tier)

## 📚 Documentação

- [Setup Completo](docs/SETUP_COMPLETO.md)
- [Configuração Cosmos DB](docs/SETUP_COSMOSDB.md)
- [Estrutura de Dados](docs/ESTRUTURA_DADOS.md)
- [Guia de Segurança](docs/SEGURANCA.md)
- [Acessibilidade](docs/ACESSIBILIDADE.md)
- [API Reference](docs/API.md)
- [Guia da Professora Virtual](docs/PROFESSORA_VIRTUAL.md)

## 🎮 Funcionalidades Detalhadas

### Professora Virtual (IA)

A professora virtual usa Azure OpenAI para:

- Explicar conceitos de forma didática e adequada à idade
- Responder dúvidas sobre lições e exercícios
- Dar exemplos práticos e analogias
- Incentivar e motivar o aluno
- Adaptar a linguagem ao nível de compreensão

### Sistema de Gamificação

- **Pontos**: Ganhe XP por exercícios completados
- **Níveis**: Evolua de "Iniciante" até "Mestre do Conhecimento"
- **Badges**: Conquiste medalhas especiais (Matemático, Leitor Assíduo, etc.)
- **Missões Diárias**: Desafios renovados todo dia
- **Streaks**: Mantenha sequências de estudo
- **Ranking Amigável**: Compare seu progresso (sem pressão)

### Jogos Educativos

- **Quiz Relâmpago**: Perguntas de múltipla escolha
- **Caça-Palavras Educativo**: Vocabulário e conceitos
- **Jogo da Memória**: Matemática e inglês
- **Corrida de Tabuada**: Velocidade e precisão
- **Desafio de Inglês**: Tradução e pronúncia

## 🌟 Impacto Social

Este projeto visa:

- ✅ Reduzir a desigualdade educacional na Baixada
- ✅ Oferecer alternativa gratuita ao reforço escolar pago
- ✅ Personalizar o ensino para cada criança
- ✅ Engajar estudantes através de gamificação
- ✅ Desenvolver autonomia e amor pelo aprendizado
- ✅ Fornecer dados para políticas públicas educacionais

## 📊 Métricas de Sucesso

- Número de alunos cadastrados
- Taxa de engajamento diário
- Melhoria de desempenho por matéria
- Tempo médio de uso
- Satisfação de responsáveis e alunos

## 🤝 Contribuindo

Contribuições são bem-vindas! Este é um projeto de impacto social.

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é open-source sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👤 Sobre o Autor

### **Márcio Gil**

Embaixador da Turma 14 do DIO Campus Expert, Estudante de Engenharia de Software, apaixonado por Educação, Inovação, tecnologia e em constante luta por Justiça Social.

**Conecte-se:**

- 💼 [LinkedIn](https://linkedin.com/in/márcio-gil-1b7669309)
- 💻 [GitHub](https://github.com/MarcioGil)
- 🌐 [Portfólio](https://marciogil.github.io/curriculum-vitae/)
- 📁 [Repositório do Projeto](https://github.com/MarcioGil/Amigo-do-Saber)

> _"Acredito que a tecnologia pode ser uma ferramenta poderosa para democratizar o acesso à educação de qualidade, especialmente para comunidades que mais precisam."_

## 🙏 Agradecimentos

- À comunidade da Baixada que inspirou este projeto
- Aos professores e educadores que compartilharam suas experiências
- À Microsoft Azure pelos serviços gratuitos que tornam isso possível

---

**Feito com ❤️ para a educação pública de qualidade**
