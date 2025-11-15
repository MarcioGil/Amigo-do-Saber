// ==============================================
// ACCESSIBILITY.JS - Controles de acessibilidade
// ==============================================

class AccessibilityManager {
  constructor() {
    this.preferences = {
      fontSize: "medium",
      highContrast: false,
      reducedMotion: false,
      underlineLinks: false,
      dyslexiaFriendly: false,
    }

    this.init()
  }

  init() {
    this.loadPreferences()
    this.applyPreferences()
    this.createPanel()
    this.setupKeyboardShortcuts()
  }

  loadPreferences() {
    const saved = storage.get("accessibility-preferences")
    if (saved) {
      try {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) }
      } catch (error) {
        console.error("Erro ao carregar preferências:", error)
      }
    }
  }

  savePreferences() {
    storage.set("accessibility-preferences", JSON.stringify(this.preferences))
  }

  applyPreferences() {
    // Font size
    document.documentElement.className = `font-size-${this.preferences.fontSize}`

    // High contrast
    if (this.preferences.highContrast) {
      document.body.classList.add("high-contrast")
    } else {
      document.body.classList.remove("high-contrast")
    }

    // Reduced motion
    if (this.preferences.reducedMotion) {
      document.body.classList.add("reduced-motion")
    } else {
      document.body.classList.remove("reduced-motion")
    }

    // Underline links
    if (this.preferences.underlineLinks) {
      document.body.classList.add("underline-links")
    } else {
      document.body.classList.remove("underline-links")
    }

    // Dyslexia friendly
    if (this.preferences.dyslexiaFriendly) {
      document.body.classList.add("dyslexia-friendly")
    } else {
      document.body.classList.remove("dyslexia-friendly")
    }
  }

  createPanel() {
    const panelHTML = `
      <button class="accessibility-toggle" aria-label="Abrir painel de acessibilidade" title="Acessibilidade">
        ♿
      </button>
      
      <div class="accessibility-panel" role="dialog" aria-label="Painel de acessibilidade" aria-modal="false">
        <h3 style="margin-bottom: var(--spacing-md);">Acessibilidade</h3>
        
        <div class="accessibility-options">
          <!-- Tamanho da fonte -->
          <div class="accessibility-option">
            <label>Tamanho da fonte:</label>
            <div style="display: flex; gap: var(--spacing-xs);">
              <button class="btn btn-sm" data-action="decrease-font" aria-label="Diminuir fonte">A-</button>
              <button class="btn btn-sm" data-action="increase-font" aria-label="Aumentar fonte">A+</button>
            </div>
          </div>
          
          <!-- Alto contraste -->
          <div class="accessibility-option">
            <label for="high-contrast-toggle">Alto contraste:</label>
            <input type="checkbox" id="high-contrast-toggle" data-pref="highContrast">
          </div>
          
          <!-- Reduzir movimento -->
          <div class="accessibility-option">
            <label for="reduced-motion-toggle">Reduzir movimento:</label>
            <input type="checkbox" id="reduced-motion-toggle" data-pref="reducedMotion">
          </div>
          
          <!-- Sublinhar links -->
          <div class="accessibility-option">
            <label for="underline-links-toggle">Sublinhar links:</label>
            <input type="checkbox" id="underline-links-toggle" data-pref="underlineLinks">
          </div>
          
          <!-- Modo dislexia -->
          <div class="accessibility-option">
            <label for="dyslexia-toggle">Modo dislexia:</label>
            <input type="checkbox" id="dyslexia-toggle" data-pref="dyslexiaFriendly">
          </div>
        </div>
        
        <div style="margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--gray-200);">
          <button class="btn btn-sm btn-outline" data-action="reset-preferences" style="width: 100%;">
            Restaurar padrões
          </button>
        </div>
      </div>
    `

    const container = document.createElement("div")
    container.innerHTML = panelHTML
    document.body.appendChild(container.firstElementChild)
    document.body.appendChild(container.lastElementChild)

    this.setupPanelEvents()
  }

  setupPanelEvents() {
    const toggle = document.querySelector(".accessibility-toggle")
    const panel = document.querySelector(".accessibility-panel")

    // Toggle panel
    toggle.addEventListener("click", () => {
      const isOpen = panel.classList.toggle("open")
      toggle.setAttribute("aria-expanded", isOpen)

      if (isOpen) {
        panel.querySelector("input, button")?.focus()
      }
    })

    // Font size buttons
    document
      .querySelector('[data-action="increase-font"]')
      ?.addEventListener("click", () => {
        this.changeFontSize("increase")
      })

    document
      .querySelector('[data-action="decrease-font"]')
      ?.addEventListener("click", () => {
        this.changeFontSize("decrease")
      })

    // Checkboxes
    document.querySelectorAll("[data-pref]").forEach((checkbox) => {
      const pref = checkbox.dataset.pref
      checkbox.checked = this.preferences[pref]

      checkbox.addEventListener("change", () => {
        this.preferences[pref] = checkbox.checked
        this.savePreferences()
        this.applyPreferences()

        announceToScreenReader(
          `${checkbox.parentElement.textContent.trim()} ${
            checkbox.checked ? "ativado" : "desativado"
          }`
        )
      })
    })

    // Reset button
    document
      .querySelector('[data-action="reset-preferences"]')
      ?.addEventListener("click", () => {
        this.preferences = {
          fontSize: "medium",
          highContrast: false,
          reducedMotion: false,
          underlineLinks: false,
          dyslexiaFriendly: false,
        }

        this.savePreferences()
        this.applyPreferences()

        // Atualizar checkboxes
        document.querySelectorAll("[data-pref]").forEach((checkbox) => {
          checkbox.checked = this.preferences[checkbox.dataset.pref]
        })

        announceToScreenReader("Preferências de acessibilidade restauradas")
        showToast("Preferências restauradas", "success")
      })

    // Fechar com ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && panel.classList.contains("open")) {
        panel.classList.remove("open")
        toggle.setAttribute("aria-expanded", "false")
        toggle.focus()
      }
    })

    // Fechar ao clicar fora
    document.addEventListener("click", (e) => {
      if (!panel.contains(e.target) && !toggle.contains(e.target)) {
        panel.classList.remove("open")
        toggle.setAttribute("aria-expanded", "false")
      }
    })
  }

  changeFontSize(direction) {
    const sizes = ["small", "medium", "large", "xlarge"]
    const currentIndex = sizes.indexOf(this.preferences.fontSize)

    let newIndex
    if (direction === "increase") {
      newIndex = Math.min(currentIndex + 1, sizes.length - 1)
    } else {
      newIndex = Math.max(currentIndex - 1, 0)
    }

    this.preferences.fontSize = sizes[newIndex]
    this.savePreferences()
    this.applyPreferences()

    const sizeNames = {
      small: "pequena",
      medium: "média",
      large: "grande",
      xlarge: "extra grande",
    }
    announceToScreenReader(`Fonte ${sizeNames[this.preferences.fontSize]}`)
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Alt + A = Abrir painel
      if (e.altKey && e.key === "a") {
        e.preventDefault()
        document.querySelector(".accessibility-toggle")?.click()
      }

      // Alt + + = Aumentar fonte
      if (e.altKey && e.key === "+") {
        e.preventDefault()
        this.changeFontSize("increase")
      }

      // Alt + - = Diminuir fonte
      if (e.altKey && e.key === "-") {
        e.preventDefault()
        this.changeFontSize("decrease")
      }

      // Alt + C = Alto contraste
      if (e.altKey && e.key === "c") {
        e.preventDefault()
        this.preferences.highContrast = !this.preferences.highContrast
        document.getElementById("high-contrast-toggle").checked =
          this.preferences.highContrast
        this.savePreferences()
        this.applyPreferences()
        announceToScreenReader(
          `Alto contraste ${
            this.preferences.highContrast ? "ativado" : "desativado"
          }`
        )
      }
    })
  }
}

// Inicializar quando DOM carregar
document.addEventListener("DOMContentLoaded", () => {
  window.accessibilityManager = new AccessibilityManager()
})

// Export para uso em outros scripts
window.toggleHighContrast = function () {
  if (window.accessibilityManager) {
    window.accessibilityManager.preferences.highContrast =
      !window.accessibilityManager.preferences.highContrast
    window.accessibilityManager.savePreferences()
    window.accessibilityManager.applyPreferences()
  }
}

window.increaseFontSize = function () {
  if (window.accessibilityManager) {
    window.accessibilityManager.changeFontSize("increase")
  }
}

window.decreaseFontSize = function () {
  if (window.accessibilityManager) {
    window.accessibilityManager.changeFontSize("decrease")
  }
}
