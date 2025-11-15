// ==============================================
// UTILITY FUNCTIONS
// ==============================================

// ==============================================
// LocalStorage Helpers
// ==============================================

const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return defaultValue
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing from localStorage:", error)
    }
  },

  clear: () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  },
}

// ==============================================
// Authentication Helpers
// ==============================================

function getAuthToken() {
  return storage.get("authToken")
}

function setAuthToken(token) {
  storage.set("authToken", token)
}

function clearAuthToken() {
  storage.remove("authToken")
}

function isAuthenticated() {
  const token = getAuthToken()
  return token && !isTokenExpired(token)
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.exp * 1000 < Date.now()
  } catch (error) {
    return true
  }
}

function getCurrentUser() {
  return storage.get("currentUser")
}

function setCurrentUser(user) {
  storage.set("currentUser", user)
}

function getCurrentAlunoId() {
  const user = getCurrentUser()
  return user?.alunoId || null
}

// ==============================================
// API Request Helper
// ==============================================

async function apiRequest(endpoint, options = {}) {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  }

  // Add auth token if available
  const token = getAuthToken()
  if (token) {
    defaultOptions.headers["Authorization"] = `Bearer ${token}`
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)

    // Handle different status codes
    if (response.status === 401) {
      // Unauthorized - redirect to login
      clearAuthToken()
      window.location.href = "/login.html"
      throw new Error("Não autorizado")
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP error ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API request error:", error)
    throw error
  }
}

// ==============================================
// Date & Time Helpers
// ==============================================

function formatDate(date, format = "short") {
  const d = new Date(date)

  const formats = {
    short: { day: "2-digit", month: "2-digit", year: "numeric" },
    long: { day: "2-digit", month: "long", year: "numeric" },
    time: { hour: "2-digit", minute: "2-digit" },
    full: {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  }

  return d.toLocaleDateString("pt-BR", formats[format] || formats.short)
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)

  const intervals = {
    ano: 31536000,
    mês: 2592000,
    semana: 604800,
    dia: 86400,
    hora: 3600,
    minuto: 60,
    segundo: 1,
  }

  for (const [name, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value)
    if (interval >= 1) {
      return `há ${interval} ${name}${
        interval > 1 && name !== "mês"
          ? "s"
          : name === "mês" && interval > 1
          ? "es"
          : ""
      }`
    }
  }

  return "agora mesmo"
}

// ==============================================
// String Helpers
// ==============================================

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function truncate(str, maxLength = 100) {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + "..."
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// ==============================================
// Number Helpers
// ==============================================

function formatNumber(num, decimals = 0) {
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function formatPercent(value, total) {
  if (total === 0) return "0%"
  return `${Math.round((value / total) * 100)}%`
}

// ==============================================
// Array Helpers
// ==============================================

function shuffle(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

// ==============================================
// Validation Helpers
// ==============================================

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function isValidPhone(phone) {
  const re = /^\+?55?\s?\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/
  return re.test(phone)
}

function isValidCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, "")

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cpf.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cpf.charAt(10))) return false

  return true
}

// ==============================================
// UI Helpers
// ==============================================

function showToast(message, type = "info", duration = 3000) {
  // Remove existing toasts
  const existing = document.querySelectorAll(".toast")
  existing.forEach((toast) => toast.remove())

  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.textContent = message
  toast.setAttribute("role", "alert")
  toast.setAttribute("aria-live", "polite")

  document.body.appendChild(toast)

  // Animate in
  setTimeout(() => toast.classList.add("show"), 10)

  // Auto remove
  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => toast.remove(), 300)
  }, duration)
}

function showLoader(show = true) {
  let loader = document.getElementById("globalLoader")

  if (!loader && show) {
    loader = document.createElement("div")
    loader.id = "globalLoader"
    loader.className = "loader-overlay"
    loader.innerHTML = `
      <div class="loader-spinner" role="status" aria-live="polite">
        <span class="sr-only">Carregando...</span>
      </div>
    `
    document.body.appendChild(loader)
  }

  if (loader) {
    loader.style.display = show ? "flex" : "none"
    if (!show) {
      setTimeout(() => loader.remove(), 300)
    }
  }
}

// ==============================================
// Accessibility Helpers
// ==============================================

function announceToScreenReader(message) {
  const announcement = document.createElement("div")
  announcement.setAttribute("role", "status")
  announcement.setAttribute("aria-live", "polite")
  announcement.className = "sr-only"
  announcement.textContent = message
  document.body.appendChild(announcement)

  setTimeout(() => announcement.remove(), 1000)
}

// ==============================================
// Materia/Subject Helpers
// ==============================================

function getCurrentMateria() {
  return storage.get("currentMateria", "Matemática")
}

function setCurrentMateria(materia) {
  storage.set("currentMateria", materia)
}

function getCurrentTopico() {
  return storage.get("currentTopico", null)
}

function setCurrentTopico(topico) {
  storage.set("currentTopico", topico)
}

// ==============================================
// Debug Helper
// ==============================================

function debug(...args) {
  if (window.location.hostname === "localhost") {
    console.log("[DEBUG]", ...args)
  }
}

// ==============================================
// Export all utilities
// ==============================================

const utils = {
  storage,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  isAuthenticated,
  getCurrentUser,
  setCurrentUser,
  getCurrentAlunoId,
  apiRequest,
  formatDate,
  timeAgo,
  escapeHtml,
  truncate,
  capitalize,
  formatNumber,
  formatPercent,
  shuffle,
  groupBy,
  isValidEmail,
  isValidPhone,
  isValidCPF,
  showToast,
  showLoader,
  announceToScreenReader,
  getCurrentMateria,
  setCurrentMateria,
  getCurrentTopico,
  setCurrentTopico,
  debug,
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = utils
}
