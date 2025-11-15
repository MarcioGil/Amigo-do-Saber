// ==============================================
// MAIN JAVASCRIPT - Global functionality
// ==============================================

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu()
  initAccessibility()
  initModals()
  initTabs()
  initDropdowns()
})

// ==============================================
// MOBILE MENU
// ==============================================

function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle")
  const nav = document.querySelector(".nav")

  if (!menuToggle || !nav) return

  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("open")
    const isOpen = nav.classList.contains("open")

    menuToggle.setAttribute("aria-expanded", isOpen)
    announceToScreenReader(isOpen ? "Menu aberto" : "Menu fechado")
  })

  // Fechar ao clicar fora
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
      nav.classList.remove("open")
      menuToggle.setAttribute("aria-expanded", "false")
    }
  })

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      nav.classList.remove("open")
      menuToggle.setAttribute("aria-expanded", "false")
      menuToggle.focus()
    }
  })
}

// ==============================================
// ACCESSIBILITY CONTROLS
// ==============================================

function initAccessibility() {
  loadAccessibilityPreferences()
  setupAccessibilityControls()
}

function loadAccessibilityPreferences() {
  const fontSize = storage.get("fontSize") || "medium"
  const highContrast = storage.get("highContrast") === "true"
  const reducedMotion = storage.get("reducedMotion") === "true"

  document.documentElement.className = `font-size-${fontSize}`

  if (highContrast) {
    document.body.classList.add("high-contrast")
  }

  if (reducedMotion) {
    document.body.classList.add("reduced-motion")
  }
}

function setupAccessibilityControls() {
  // Botão de aumentar fonte
  const increaseFontBtns = document.querySelectorAll(
    '[data-action="increase-font"]'
  )
  increaseFontBtns.forEach((btn) => {
    btn.addEventListener("click", () => changeFontSize("increase"))
  })

  // Botão de diminuir fonte
  const decreaseFontBtns = document.querySelectorAll(
    '[data-action="decrease-font"]'
  )
  decreaseFontBtns.forEach((btn) => {
    btn.addEventListener("click", () => changeFontSize("decrease"))
  })

  // Alto contraste
  const highContrastBtns = document.querySelectorAll(
    '[data-action="toggle-contrast"]'
  )
  highContrastBtns.forEach((btn) => {
    btn.addEventListener("click", toggleHighContrast)
  })
}

function changeFontSize(direction) {
  const sizes = ["small", "medium", "large", "xlarge"]
  const currentClass = document.documentElement.className
  const currentSize = sizes.find((s) => currentClass.includes(s)) || "medium"
  const currentIndex = sizes.indexOf(currentSize)

  let newIndex
  if (direction === "increase") {
    newIndex = Math.min(currentIndex + 1, sizes.length - 1)
  } else {
    newIndex = Math.max(currentIndex - 1, 0)
  }

  const newSize = sizes[newIndex]
  document.documentElement.className = `font-size-${newSize}`
  storage.set("fontSize", newSize)

  announceToScreenReader(`Tamanho da fonte alterado para ${newSize}`)
}

function toggleHighContrast() {
  const isActive = document.body.classList.toggle("high-contrast")
  storage.set("highContrast", isActive)
  announceToScreenReader(
    isActive ? "Alto contraste ativado" : "Alto contraste desativado"
  )
}

// ==============================================
// MODALS
// ==============================================

function initModals() {
  // Abrir modals
  const modalTriggers = document.querySelectorAll("[data-modal]")
  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault()
      const modalId = trigger.dataset.modal
      openModal(modalId)
    })
  })

  // Fechar modals
  const closeButtons = document.querySelectorAll(
    ".modal-close, [data-modal-close]"
  )
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal-overlay")
      if (modal) closeModal(modal)
    })
  })

  // Fechar ao clicar no overlay
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal(overlay)
      }
    })
  })

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openModal = document.querySelector(".modal-overlay")
      if (openModal) closeModal(openModal)
    }
  })
}

function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (!modal) return

  modal.style.display = "flex"
  modal.setAttribute("aria-hidden", "false")

  // Focar no primeiro elemento focável
  const focusable = modal.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  if (focusable) {
    setTimeout(() => focusable.focus(), 100)
  }

  // Trap focus
  trapFocus(modal)
}

function closeModal(modal) {
  modal.style.display = "none"
  modal.setAttribute("aria-hidden", "true")
}

function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  element.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus()
        e.preventDefault()
      }
    }
  })
}

// ==============================================
// TABS
// ==============================================

function initTabs() {
  const tabLists = document.querySelectorAll('[role="tablist"]')

  tabLists.forEach((tabList) => {
    const tabs = tabList.querySelectorAll('[role="tab"]')
    const panels = document.querySelectorAll('[role="tabpanel"]')

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        // Desativar todas as tabs
        tabs.forEach((t) => {
          t.classList.remove("active")
          t.setAttribute("aria-selected", "false")
          t.setAttribute("tabindex", "-1")
        })

        // Ocultar todos os painéis
        panels.forEach((p) => {
          p.classList.remove("active")
          p.setAttribute("hidden", "")
        })

        // Ativar tab clicada
        tab.classList.add("active")
        tab.setAttribute("aria-selected", "true")
        tab.setAttribute("tabindex", "0")

        // Mostrar painel correspondente
        const panelId = tab.getAttribute("aria-controls")
        const panel = document.getElementById(panelId)
        if (panel) {
          panel.classList.add("active")
          panel.removeAttribute("hidden")
        }
      })

      // Navegação por teclado
      tab.addEventListener("keydown", (e) => {
        let newIndex

        if (e.key === "ArrowLeft") {
          newIndex = index === 0 ? tabs.length - 1 : index - 1
        } else if (e.key === "ArrowRight") {
          newIndex = index === tabs.length - 1 ? 0 : index + 1
        } else if (e.key === "Home") {
          newIndex = 0
        } else if (e.key === "End") {
          newIndex = tabs.length - 1
        }

        if (newIndex !== undefined) {
          tabs[newIndex].click()
          tabs[newIndex].focus()
          e.preventDefault()
        }
      })
    })
  })
}

// ==============================================
// DROPDOWNS
// ==============================================

function initDropdowns() {
  const dropdowns = document.querySelectorAll(".dropdown")

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector("[data-dropdown-toggle]")
    const menu = dropdown.querySelector(".dropdown-menu")

    if (!toggle || !menu) return

    toggle.addEventListener("click", (e) => {
      e.stopPropagation()
      dropdown.classList.toggle("open")
      const isOpen = dropdown.classList.contains("open")
      toggle.setAttribute("aria-expanded", isOpen)
    })

    // Fechar ao clicar fora
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open")
        toggle.setAttribute("aria-expanded", "false")
      }
    })

    // Fechar com ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && dropdown.classList.contains("open")) {
        dropdown.classList.remove("open")
        toggle.setAttribute("aria-expanded", "false")
        toggle.focus()
      }
    })
  })
}

// ==============================================
// FORM VALIDATION
// ==============================================

function validateForm(form) {
  let isValid = true
  const inputs = form.querySelectorAll("[required]")

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      showFieldError(input, "Este campo é obrigatório")
      isValid = false
    } else {
      clearFieldError(input)
    }
  })

  return isValid
}

function showFieldError(input, message) {
  clearFieldError(input)

  input.setAttribute("aria-invalid", "true")
  input.classList.add("error")

  const errorDiv = document.createElement("div")
  errorDiv.className = "form-error"
  errorDiv.id = `${input.id}-error`
  errorDiv.textContent = message

  input.setAttribute("aria-describedby", errorDiv.id)
  input.parentNode.appendChild(errorDiv)
}

function clearFieldError(input) {
  input.setAttribute("aria-invalid", "false")
  input.classList.remove("error")

  const error = input.parentNode.querySelector(".form-error")
  if (error) error.remove()
}

// ==============================================
// SMOOTH SCROLL
// ==============================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href")
    if (href === "#") return

    e.preventDefault()
    const target = document.querySelector(href)

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })

      // Focar no elemento após scroll
      setTimeout(() => {
        target.focus()
        if (document.activeElement !== target) {
          target.setAttribute("tabindex", "-1")
          target.focus()
        }
      }, 500)
    }
  })
})

// ==============================================
// EXPORTS (para outros scripts)
// ==============================================

window.app = {
  openModal,
  closeModal,
  validateForm,
  showFieldError,
  clearFieldError,
}
