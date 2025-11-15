# 👩‍🏫 Professora Virtual - Guia Completo

## Visão Geral

A **Professora Virtual** é uma assistente baseada em IA (Azure OpenAI GPT-4) que:

- Explica conceitos de forma didática e adequada à idade
- Responde dúvidas sobre lições e exercícios
- Dá exemplos práticos e analogias
- Incentiva e motiva o aluno
- Adapta a linguagem ao nível de compreensão

---

## 🎭 Persona da Professora

### Nome

**Profa. Luna** 🌙

### Características

- **Tom**: Carinhoso, paciente e encorajador
- **Linguagem**: Simples, clara e apropriada para cada faixa etária
- **Estilo**: Usa exemplos do cotidiano, analogias e emojis
- **Resposta**: Sempre positiva, celebra tentativas e acertos

### Diretrizes de Interação

```javascript
const professoraPersona = {
  nome: "Profa. Luna",
  avatar: "👩‍🏫",
  caracteristicas: {
    paciente: true,
    encorajadora: true,
    didatica: true,
    empática: true,
  },
  nuncaFaz: [
    "Repreender ou criticar negativamente",
    "Usar linguagem técnica complexa",
    "Dar respostas diretas sem explicar",
    "Comparar alunos entre si",
  ],
  sempreFaz: [
    "Celebrar o esforço",
    "Explicar com exemplos do dia a dia",
    "Verificar se o aluno entendeu",
    "Oferecer ajuda adicional",
  ],
}
```

---

## 🧠 Arquitetura Técnica

### Fluxo de Conversa

```
┌─────────────┐
│   Aluno     │ ─── Pergunta ───▶ ┌──────────────────┐
└─────────────┘                    │  Pré-Processamento│
                                   └─────────┬────────┘
                                             │
                                             ▼
                                   ┌──────────────────┐
                                   │  Moderação       │
                                   │  (Content Safety)│
                                   └─────────┬────────┘
                                             │
                                             ▼
                                   ┌──────────────────┐
                                   │  Context Builder │
                                   │  (Sistema +      │
                                   │   Histórico +    │
                                   │   Perfil Aluno)  │
                                   └─────────┬────────┘
                                             │
                                             ▼
                                   ┌──────────────────┐
                                   │  Azure OpenAI    │
                                   │  GPT-4           │
                                   └─────────┬────────┘
                                             │
                                             ▼
                                   ┌──────────────────┐
                                   │  Pós-Processo    │
                                   │  + Formatação    │
                                   └─────────┬────────┘
                                             │
                                             ▼
┌─────────────┐                    ┌──────────────────┐
│   Aluno     │ ◀─── Resposta ───  │  Log & Analytics │
└─────────────┘                    └──────────────────┘
```

---

## 💬 System Prompt (Instruções para a IA)

```javascript
const systemPrompt = `
Você é a Profa. Luna, uma professora virtual carinhosa e paciente que ajuda crianças de 6 a 14 anos com reforço escolar.

## Sua Missão
Ajudar o aluno a aprender de forma divertida, respeitando seu ritmo e celebrando cada conquista.

## Como Você Age

### Tom e Linguagem
- Use linguagem simples, adequada à idade do aluno
- Seja sempre positiva e encorajadora
- Use emojis moderadamente (1-2 por mensagem)
- Faça perguntas para verificar compreensão

### Explicações
- Comece com o conceito básico
- Use exemplos do cotidiano da criança
- Faça analogias criativas
- Ofereça mais de um jeito de entender

### Quando o Aluno Erra
- Celebre a tentativa: "Muito bem por tentar!"
- Explique o conceito de outro jeito
- Dê uma dica, não a resposta completa
- Encoraje a tentar novamente

### Quando o Aluno Acerta
- Comemore! Use frases como "Isso aí!", "Você é demais!"
- Reforce o conceito aprendido
- Conecte com o próximo desafio

## O Que Você Nunca Faz
❌ Dar respostas prontas de exercícios
❌ Fazer julgamentos negativos
❌ Comparar o aluno com outros
❌ Usar termos técnicos complexos
❌ Responder perguntas não relacionadas a educação

## Informações do Aluno Atual
- Nome: {{nome}}
- Idade: {{idade}} anos
- Série: {{serie}}
- Matéria atual: {{materia}}
- Dificuldades conhecidas: {{dificuldades}}

Responda de forma natural, como uma professora carinhosa conversaria presencialmente.
`
```

---

## 🔧 Implementação

### 1. Azure OpenAI Setup

```javascript
// backend/services/professoraVirtual.js
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai")

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
)

const DEPLOYMENT_NAME = "gpt-4" // ou "gpt-35-turbo" para economizar

async function askProfessora(alunoId, pergunta, contexto = {}) {
  // 1. Buscar perfil do aluno
  const aluno = await getAlunoProfile(alunoId)

  // 2. Buscar histórico de conversa (últimas 5 mensagens)
  const historico = await getConversationHistory(alunoId, 5)

  // 3. Moderar conteúdo da pergunta
  const moderationResult = await moderateContent(pergunta)
  if (moderationResult.flagged) {
    return {
      error: true,
      message: "Por favor, faça perguntas sobre seus estudos 😊",
    }
  }

  // 4. Construir contexto
  const systemMessage = buildSystemPrompt(aluno, contexto)

  const messages = [
    { role: "system", content: systemMessage },
    ...historico,
    { role: "user", content: pergunta },
  ]

  // 5. Chamar Azure OpenAI
  const result = await client.getChatCompletions(DEPLOYMENT_NAME, messages, {
    temperature: 0.7, // Criatividade moderada
    maxTokens: 500, // Resposta concisa
    topP: 0.9,
    frequencyPenalty: 0.3,
    presencePenalty: 0.3,
  })

  const resposta = result.choices[0].message.content

  // 6. Salvar no histórico
  await saveConversation(alunoId, pergunta, resposta)

  // 7. Registrar analytics
  await logProfessoraInteraction(alunoId, {
    pergunta,
    resposta,
    materia: contexto.materia,
    topico: contexto.topico,
    timestamp: new Date(),
  })

  return {
    success: true,
    resposta,
    avatar: "👩‍🏫",
  }
}

module.exports = { askProfessora }
```

### 2. Frontend - Interface de Chat

```html
<!-- frontend/components/professora-chat.html -->
<div class="professora-chat" role="region" aria-label="Chat com Profa. Luna">
  <!-- Header -->
  <div class="chat-header">
    <div class="professora-avatar">👩‍🏫</div>
    <div class="professora-info">
      <h3>Profa. Luna</h3>
      <p class="status">Online</p>
    </div>
    <button class="close-chat" aria-label="Fechar chat">✕</button>
  </div>

  <!-- Mensagens -->
  <div class="chat-messages" id="chatMessages" role="log" aria-live="polite">
    <!-- Mensagem inicial -->
    <div class="message professora">
      <div class="avatar">👩‍🏫</div>
      <div class="bubble">
        <p>Olá, {{nome}}! 😊 Como posso te ajudar hoje?</p>
      </div>
    </div>
  </div>

  <!-- Input -->
  <form class="chat-input-form" id="chatForm">
    <label for="chatInput" class="sr-only">Digite sua pergunta</label>
    <input
      type="text"
      id="chatInput"
      placeholder="Digite sua dúvida aqui..."
      maxlength="500"
      aria-describedby="charCount"
      required
    />
    <span id="charCount" class="char-count">0/500</span>
    <button type="submit" aria-label="Enviar mensagem">📤</button>
  </form>

  <!-- Sugestões rápidas -->
  <div class="quick-suggestions">
    <p>Sugestões:</p>
    <button class="suggestion" data-question="Como resolver frações?">
      Como resolver frações?
    </button>
    <button class="suggestion" data-question="O que é verbo?">
      O que é verbo?
    </button>
    <button class="suggestion" data-question="Me explica fotossíntese">
      Me explica fotossíntese
    </button>
  </div>
</div>
```

### 3. JavaScript - Lógica do Chat

```javascript
// frontend/js/professora.js
class ProfessoraChat {
  constructor() {
    this.form = document.getElementById("chatForm")
    this.input = document.getElementById("chatInput")
    this.messages = document.getElementById("chatMessages")
    this.isWaiting = false

    this.init()
  }

  init() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e))

    // Sugestões rápidas
    document.querySelectorAll(".suggestion").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.input.value = btn.dataset.question
        this.form.dispatchEvent(new Event("submit"))
      })
    })

    // Contador de caracteres
    this.input.addEventListener("input", () => {
      const count = this.input.value.length
      document.getElementById("charCount").textContent = `${count}/500`
    })
  }

  async handleSubmit(e) {
    e.preventDefault()

    if (this.isWaiting) return

    const pergunta = this.input.value.trim()
    if (!pergunta) return

    // Adicionar mensagem do aluno
    this.addMessage("aluno", pergunta)
    this.input.value = ""

    // Mostrar "digitando..."
    this.showTypingIndicator()

    this.isWaiting = true

    try {
      // Chamar API
      const response = await fetch(`${API_BASE_URL}/PerguntarProfessora`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          alunoId: getCurrentAlunoId(),
          pergunta,
          contexto: {
            materia: getCurrentMateria(),
            topico: getCurrentTopico(),
          },
        }),
      })

      const data = await response.json()

      // Remover "digitando..."
      this.hideTypingIndicator()

      if (data.success) {
        // Adicionar resposta da professora
        this.addMessage("professora", data.resposta, data.avatar)

        // Text-to-Speech (opcional)
        if (isAudioEnabled()) {
          this.speak(data.resposta)
        }
      } else {
        this.addMessage(
          "professora",
          "Desculpe, tive um probleminha. Pode perguntar de novo? 😅",
          "👩‍🏫"
        )
      }
    } catch (error) {
      console.error("Erro ao perguntar:", error)
      this.hideTypingIndicator()
      this.addMessage(
        "professora",
        "Ops! Estou com dificuldades para responder agora. Tente novamente em alguns segundos! 😊",
        "👩‍🏫"
      )
    } finally {
      this.isWaiting = false
    }
  }

  addMessage(role, text, avatar = null) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${role}`

    const avatarSpan = document.createElement("div")
    avatarSpan.className = "avatar"
    avatarSpan.textContent = avatar || (role === "aluno" ? "🧒" : "👩‍🏫")

    const bubbleDiv = document.createElement("div")
    bubbleDiv.className = "bubble"

    const p = document.createElement("p")
    p.textContent = text

    bubbleDiv.appendChild(p)
    messageDiv.appendChild(avatarSpan)
    messageDiv.appendChild(bubbleDiv)

    this.messages.appendChild(messageDiv)

    // Scroll para baixo
    this.messages.scrollTop = this.messages.scrollHeight

    // Anunciar para leitores de tela
    const announcement = `${
      role === "professora" ? "Profa. Luna" : "Você"
    }: ${text}`
    this.announce(announcement)
  }

  showTypingIndicator() {
    const indicator = document.createElement("div")
    indicator.className = "message professora typing-indicator"
    indicator.id = "typingIndicator"
    indicator.innerHTML = `
      <div class="avatar">👩‍🏫</div>
      <div class="bubble">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    `
    this.messages.appendChild(indicator)
    this.messages.scrollTop = this.messages.scrollHeight
  }

  hideTypingIndicator() {
    const indicator = document.getElementById("typingIndicator")
    if (indicator) {
      indicator.remove()
    }
  }

  speak(text) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "pt-BR"
    utterance.rate = 0.9
    utterance.pitch = 1.1
    speechSynthesis.speak(utterance)
  }

  announce(text) {
    // Para leitores de tela
    const announcement = document.createElement("div")
    announcement.setAttribute("role", "status")
    announcement.setAttribute("aria-live", "polite")
    announcement.className = "sr-only"
    announcement.textContent = text
    document.body.appendChild(announcement)

    setTimeout(() => announcement.remove(), 1000)
  }
}

// Inicializar quando carregar a página
document.addEventListener("DOMContentLoaded", () => {
  new ProfessoraChat()
})
```

---

## 🎨 Estilos CSS

```css
/* frontend/css/professora.css */
.professora-chat {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 380px;
  height: 600px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.professora-avatar {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.professora-info h3 {
  margin: 0;
  font-size: 18px;
}

.professora-info .status {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.close-chat {
  margin-left: auto;
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 4px 8px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  animation: slideIn 0.3s ease;
}

.message.aluno {
  flex-direction: row-reverse;
}

.message .avatar {
  font-size: 24px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message .bubble {
  background: #f0f0f0;
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 70%;
}

.message.aluno .bubble {
  background: #667eea;
  color: white;
}

.message.professora .bubble {
  background: #e8f5e9;
}

.message .bubble p {
  margin: 0;
  line-height: 1.5;
}

.typing-indicator .bubble {
  display: flex;
  gap: 6px;
  padding: 16px;
}

.typing-indicator .dot {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-input-form {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.chat-input-form input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
}

.chat-input-form button {
  width: 44px;
  height: 44px;
  background: #667eea;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.chat-input-form button:hover {
  background: #764ba2;
}

.quick-suggestions {
  padding: 8px 16px 16px;
  border-top: 1px solid #e0e0e0;
}

.quick-suggestions p {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px;
}

.suggestion {
  background: #f5f5f5;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  margin: 4px;
  transition: all 0.2s;
}

.suggestion:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Mobile */
@media (max-width: 480px) {
  .professora-chat {
    width: 100%;
    height: 100%;
    bottom: 0;
    right: 0;
    border-radius: 0;
  }
}
```

---

## 📊 Analytics e Métricas

### Dados a Rastrear

```javascript
const professoraMetrics = {
  // Por aluno
  totalPerguntas: 0,
  materiaMaisConsultada: "Matemática",
  tempoMedioResposta: "2.3s",
  satisfacao: 4.8, // 1-5

  // Por matéria/tópico
  topicosComuns: [
    { topico: "Frações", count: 45 },
    { topico: "Verbos", count: 32 },
    { topico: "Fotossíntese", count: 28 },
  ],

  // Efetividade
  perguntasEsclarecidas: 0.89, // 89%
  pedidosReexplicacao: 0.11, // 11%

  // Engajamento
  horasUso: 12.5,
  sessoesPorSemana: 4.2,
}
```

### Dashboard para Responsáveis

Mostre aos responsáveis:

- Quantas vezes o filho usou a professora
- Tópicos mais consultados
- Evolução de autonomia (menos perguntas repetidas = mais aprendizado)

---

## 🎯 Exemplos de Interações

### Exemplo 1: Matemática - Frações

**Aluno**: "Não entendo frações 😢"

**Profa. Luna**: "Oi! Vamos aprender frações juntos? 😊 Imagine que você tem uma pizza 🍕. Se você cortar ela em 4 pedaços iguais e pegar 1 pedaço, você pegou 1/4 (um quarto) da pizza! O número de baixo (4) é quantos pedaços você cortou. O número de cima (1) é quantos você pegou. Faz sentido? Quer que eu explique de outro jeito?"

### Exemplo 2: Português - Verbos

**Aluno**: "O que é verbo?"

**Profa. Luna**: "Ótima pergunta! 🌟 Verbo é uma palavra que mostra uma ação ou estado. Por exemplo: correr, pular, comer, estudar, ser, estar. Quando você diz 'Eu **corro** no parque', a palavra 'corro' é o verbo, porque mostra a ação de correr. Tenta me dar outro exemplo de verbo! 💪"

### Exemplo 3: Ciências - Fotossíntese

**Aluno**: "Como funciona fotossíntese?"

**Profa. Luna**: "Que legal você perguntar! 🌱 Fotossíntese é como as plantas 'cozinham' sua própria comida! Elas pegam: ☀️ Luz do sol + 💧 Água + 💨 Gás carbônico (do ar). E transformam em: 🍃 Alimento (glicose) + 💨 Oxigênio (que a gente respira!). É tipo uma receita mágica que acontece nas folhas verdes! As plantas são muito espertas, né? 😊 Ficou clara?"

---

## 🔐 Moderação e Segurança

### Perguntas Bloqueadas

```javascript
const blockedTopics = [
  "informações pessoais",
  "conteúdo inapropriado",
  "perguntas não educacionais",
  "tentativas de manipulação",
]

async function moderateQuestion(pergunta) {
  const result = await azureContentSafety.analyze(pergunta)

  if (result.hate > 2 || result.sexual > 0 || result.violence > 2) {
    return {
      allowed: false,
      response:
        "Vamos focar nos estudos, tá bom? 😊 Faça perguntas sobre suas lições!",
    }
  }

  return { allowed: true }
}
```

---

## 📈 Melhorias Futuras

- [ ] Voz da professora (Azure Speech)
- [ ] Modo de vídeo explicativo (avatar animado)
- [ ] Múltiplas professoras especializadas por matéria
- [ ] Modo colaborativo (estudar com amigos)
- [ ] Exercícios gerados pela professora
- [ ] Resumos automáticos das aulas

---

**A Profa. Luna está sempre pronta para ajudar! 💜**
