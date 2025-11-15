// ==============================================
// CONFIGURATION - API endpoints and settings
// ==============================================

const CONFIG = {
  // API Base URL (Azure Functions)
  API_BASE_URL:
    window.location.hostname === "localhost"
      ? "http://localhost:7071/api"
      : "https://amigo-do-saber-api.azurewebsites.net/api",

  // Azure AD B2C (será configurado na implementação)
  AUTH: {
    clientId: "SEU_CLIENT_ID",
    authority:
      "https://amigodosaber.b2clogin.com/amigodosaber.onmicrosoft.com/B2C_1_signupsignin",
    redirectUri: window.location.origin + "/auth/callback",
  },

  // Features flags
  FEATURES: {
    professoraVirtual: true,
    botConselheiro: true,
    jogosEducativos: true,
    gamificacao: true,
    ingles: true,
    textToSpeech: true,
    notifications: true,
  },

  // Analytics
  ANALYTICS: {
    enabled: true,
    appInsightsKey: "SEU_APP_INSIGHTS_KEY",
  },

  // Limits
  LIMITS: {
    maxPerguntasProfessora: 50, // por dia
    maxExerciciosPorDia: 100,
    maxUploadSize: 5 * 1024 * 1024, // 5MB
  },

  // Version
  VERSION: "1.0.0",
}

// Export para módulos
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG
}
