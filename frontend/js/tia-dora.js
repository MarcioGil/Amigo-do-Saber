// ==============================================
// TIA DORA CHAT - JavaScript
// ==============================================

class TiaDoraChat {
  constructor() {
    this.messagesContainer = document.getElementById("messages-container")
    this.messageForm = document.getElementById("message-form")
    this.messageInput = document.getElementById("message-input")
    this.sendBtn = document.getElementById("send-btn")
    this.typingIndicator = document.getElementById("typing-indicator")
    this.charCounter = document.getElementById("char-counter")
    this.quickSuggestions = document.getElementById("quick-suggestions")

    this.conversationHistory = []
    this.isWaitingResponse = false

    this.init()
  }

  init() {
    // Event listeners
    this.messageForm.addEventListener("submit", (e) => this.handleSubmit(e))
    this.messageInput.addEventListener("input", () => this.updateCharCounter())

    // Sugestões rápidas
    const suggestionBtns = document.querySelectorAll(".suggestion-btn")
    suggestionBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const question = btn.dataset.question
        this.messageInput.value = question
        this.messageInput.focus()
        this.updateCharCounter()
      })
    })

    // Auto-resize textarea
    this.messageInput.addEventListener("input", () => {
      this.messageInput.style.height = "auto"
      this.messageInput.style.height = this.messageInput.scrollHeight + "px"
    })

    // Verificar autenticação
    if (!isAuthenticated()) {
      window.location.href = "login.html"
      return
    }

    // Carregar histórico (se houver)
    this.loadHistory()
  }

  updateCharCounter() {
    const count = this.messageInput.value.length
    this.charCounter.textContent = `${count}/500`

    if (count > 450) {
      this.charCounter.style.color = "var(--warning-500)"
    } else {
      this.charCounter.style.color = "var(--text-secondary)"
    }
  }

  async handleSubmit(e) {
    e.preventDefault()

    if (this.isWaitingResponse) return

    const message = this.messageInput.value.trim()

    if (!message) return

    // Adicionar mensagem do usuário
    this.addMessage("user", message)

    // Limpar input
    this.messageInput.value = ""
    this.updateCharCounter()

    // Ocultar sugestões após primeira mensagem
    if (this.quickSuggestions) {
      this.quickSuggestions.style.display = "none"
    }

    // Mostrar indicador de digitação
    this.showTypingIndicator()

    // Desabilitar envio
    this.isWaitingResponse = true
    this.sendBtn.disabled = true

    try {
      // Chamar API
      const user = JSON.parse(storage.get("user") || "{}")
      const alunoId = user.id

      const response = await apiRequest("/tia-dora", {
        method: "POST",
        body: JSON.stringify({
          alunoId,
          pergunta: message,
          contexto: {
            materia: getCurrentMateria(),
            topico: null,
          },
        }),
      })

      // Ocultar indicador de digitação
      this.hideTypingIndicator()

      if (response.success) {
        // Adicionar resposta da Tia Dora
        this.addMessage("assistant", response.data.resposta)

        // Atualizar info de rate limit
        if (response.data.rateLimitInfo) {
          this.updateRateLimitInfo(response.data.rateLimitInfo)
        }

        // Anunciar para leitores de tela
        announceToScreenReader(
          `Tia Dora respondeu: ${response.data.resposta.substring(0, 100)}`
        )
      } else {
        this.addMessage(
          "assistant",
          "Desculpe querido, tive um probleminha técnico. Tenta perguntar de novo em alguns segundos? 💜"
        )
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)

      this.hideTypingIndicator()

      this.addMessage(
        "assistant",
        "Ops! Parece que estou com dificuldade para responder agora. Verifica sua internet e tenta de novo, tá bom? 🎀"
      )

      showToast("Erro ao enviar mensagem. Tente novamente.", "error")
    } finally {
      this.isWaitingResponse = false
      this.sendBtn.disabled = false
      this.messageInput.focus()
    }
  }

  addMessage(role, content) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${role}`

    const avatar = document.createElement("div")
    avatar.className = "avatar-small"
    avatar.textContent = role === "user" ? "👤" : "🎀"

    const messageContent = document.createElement("div")
    messageContent.className = "message-content"

    const messageText = document.createElement("div")
    messageText.className = "message-text"
    messageText.textContent = content

    const messageTime = document.createElement("span")
    messageTime.className = "message-time"
    messageTime.textContent = formatDate(new Date(), "time")

    messageContent.appendChild(messageText)
    messageContent.appendChild(messageTime)

    messageDiv.appendChild(avatar)
    messageDiv.appendChild(messageContent)

    this.messagesContainer.appendChild(messageDiv)

    // Scroll para última mensagem
    this.scrollToBottom()

    // Salvar no histórico
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString(),
    })
    this.saveHistory()
  }

  showTypingIndicator() {
    this.typingIndicator.style.display = "flex"
    this.scrollToBottom()
  }

  hideTypingIndicator() {
    this.typingIndicator.style.display = "none"
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight
    }, 100)
  }

  updateRateLimitInfo(info) {
    const rateLimitDiv = document.getElementById("rate-limit-info")
    if (rateLimitDiv && info.perguntasRestantes !== undefined) {
      rateLimitDiv.innerHTML = `
        <small>💡 Você pode fazer mais ${info.perguntasRestantes} perguntas</small>
      `

      if (info.perguntasRestantes < 10) {
        rateLimitDiv.style.color = "var(--warning-600)"
      }
    }
  }

  loadHistory() {
    const saved = storage.get("tia-dora-history")
    if (saved) {
      try {
        this.conversationHistory = JSON.parse(saved)

        // Renderizar últimas 10 mensagens
        const recent = this.conversationHistory.slice(-10)
        recent.forEach((msg) => {
          this.addMessage(msg.role, msg.content)
        })
      } catch (error) {
        console.error("Erro ao carregar histórico:", error)
      }
    }
  }

  saveHistory() {
    // Manter apenas últimas 50 mensagens
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50)
    }

    storage.set("tia-dora-history", JSON.stringify(this.conversationHistory))
  }
}

// Inicializar quando página carregar
document.addEventListener("DOMContentLoaded", () => {
  const chat = new TiaDoraChat()

  // Fazer input focar automaticamente
  setTimeout(() => {
    document.getElementById("message-input")?.focus()
  }, 500)
})
