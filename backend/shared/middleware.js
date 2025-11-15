// ==============================================
// MIDDLEWARE - Validation, Auth, Error Handling
// ==============================================

const jwt = require("jsonwebtoken")
const Joi = require("joi")

// ==============================================
// JWT TOKEN VALIDATION
// ==============================================

function validateToken(context, req) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    context.res = {
      status: 401,
      body: { error: "Token de autenticação não fornecido" },
    }
    return null
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch (error) {
    context.res = {
      status: 401,
      body: { error: "Token inválido ou expirado" },
    }
    return null
  }
}

// ==============================================
// INPUT VALIDATION SCHEMAS
// ==============================================

const schemas = {
  cadastroResponsavel: Joi.object({
    responsavel: Joi.object({
      nome: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      telefone: Joi.string()
        .pattern(/^\+?55?\s?\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/)
        .required(),
      parentesco: Joi.string()
        .valid("Mãe", "Pai", "Avó", "Avô", "Tia", "Tio", "Outro")
        .required(),
    }).required(),
    aluno: Joi.object({
      nome: Joi.string().min(2).max(100).required(),
      dataNascimento: Joi.date().max("now").required(),
      serie: Joi.string()
        .valid(
          "1º Ano",
          "2º Ano",
          "3º Ano",
          "4º Ano",
          "5º Ano",
          "6º Ano",
          "7º Ano",
          "8º Ano",
          "9º Ano"
        )
        .required(),
      escola: Joi.string().max(200).optional(),
      materias: Joi.array().items(Joi.string()).min(1).required(),
      livrosDidaticos: Joi.array()
        .items(
          Joi.object({
            materia: Joi.string().required(),
            titulo: Joi.string().required(),
            editora: Joi.string().optional(),
            isbn: Joi.string().optional(),
          })
        )
        .optional(),
    }).required(),
    senha: Joi.string().min(8).required(),
  }),

  atualizarProgresso: Joi.object({
    alunoId: Joi.string().uuid().required(),
    materia: Joi.string().required(),
    topico: Joi.string().required(),
    subtopico: Joi.string().optional(),
    resultado: Joi.object({
      correto: Joi.boolean().required(),
      tempoSegundos: Joi.number().min(0).required(),
      tentativas: Joi.number().min(1).required(),
      ajudaProfessora: Joi.boolean().default(false),
    }).required(),
  }),

  perguntaProfessora: Joi.object({
    alunoId: Joi.string().uuid().required(),
    pergunta: Joi.string().min(3).max(500).required(),
    contexto: Joi.object({
      materia: Joi.string().optional(),
      topico: Joi.string().optional(),
    }).optional(),
  }),
}

function validateInput(data, schemaName) {
  const schema = schemas[schemaName]
  if (!schema) {
    throw new Error(`Schema ${schemaName} não encontrado`)
  }

  const { error, value } = schema.validate(data, { abortEarly: false })

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join("."),
      message: d.message,
    }))
    return { valid: false, errors }
  }

  return { valid: true, value }
}

// ==============================================
// ERROR HANDLER
// ==============================================

function handleError(context, error, statusCode = 500) {
  console.error("Error:", error)

  context.res = {
    status: statusCode,
    body: {
      error: error.message || "Erro interno do servidor",
      timestamp: new Date().toISOString(),
    },
  }
}

// ==============================================
// RESPONSE HELPERS
// ==============================================

function successResponse(data, statusCode = 200) {
  return {
    status: statusCode,
    body: {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
  }
}

function errorResponse(message, statusCode = 400) {
  return {
    status: statusCode,
    body: {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    },
  }
}

// ==============================================
// RATE LIMITING (Simple in-memory)
// ==============================================

const rateLimitStore = new Map()

function checkRateLimit(key, maxRequests = 100, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitStore.get(key) || {
    count: 0,
    resetTime: now + windowMs,
  }

  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + windowMs
  }

  record.count++
  rateLimitStore.set(key, record)

  return {
    allowed: record.count <= maxRequests,
    remaining: Math.max(0, maxRequests - record.count),
    resetTime: record.resetTime,
  }
}

// ==============================================
// EXPORTS
// ==============================================

module.exports = {
  validateToken,
  validateInput,
  handleError,
  successResponse,
  errorResponse,
  checkRateLimit,
}
