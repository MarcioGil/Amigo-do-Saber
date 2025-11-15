// ==============================================
// PERGUNTAR PARA TIA DORA 🎀
// ==============================================

const { v4: uuidv4 } = require("uuid")
const {
  getItem,
  queryItems,
  createItem,
  logInteraction,
} = require("../shared/cosmosClient")
const {
  perguntarTiaDora,
  verificarConteudoInapropriado,
} = require("../shared/openaiClient")
const {
  validateToken,
  validateInput,
  handleError,
  successResponse,
  errorResponse,
  checkRateLimit,
} = require("../shared/middleware")

module.exports = async function (context, req) {
  context.log("Tia Dora - Início da conversa")

  // CORS preflight
  if (req.method === "OPTIONS") {
    context.res = { status: 200, body: "" }
    return
  }

  try {
    // 1. Validar token
    const user = validateToken(context, req)
    if (!user) return

    // 2. Validar input
    const validation = validateInput(req.body, "perguntaProfessora")
    if (!validation.valid) {
      context.res = errorResponse("Dados inválidos", 400)
      context.res.body.errors = validation.errors
      return
    }

    const { alunoId, pergunta, contexto } = validation.value

    // 3. Verificar autorização
    if (user.alunoId !== alunoId) {
      context.res = errorResponse("Não autorizado", 403)
      return
    }

    // 4. Rate limiting - máximo 50 perguntas por hora
    const rateLimitKey = `tia-dora-${alunoId}`
    const rateLimit = checkRateLimit(rateLimitKey, 50, 3600000) // 50 requests, 1 hora

    if (!rateLimit.allowed) {
      context.res = errorResponse(
        "Você já fez muitas perguntas! Que tal descansar um pouquinho e voltar em alguns minutos? 😊",
        429
      )
      context.res.headers = {
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
      }
      return
    }

    // 5. Moderação de conteúdo
    const moderacao = verificarConteudoInapropriado(pergunta)
    if (!moderacao.apropriado) {
      context.res = errorResponse(
        "Ops! Essa pergunta não parece ser sobre estudos. A Tia Dora só pode ajudar com matérias da escola, tá bom? 📚",
        400
      )

      // Log de tentativa de conteúdo inapropriado
      await logInteraction(alunoId, "moderacao-bloqueio", {
        motivo: moderacao.motivo,
        pergunta: pergunta.substring(0, 100), // Primeiros 100 chars apenas
      })

      return
    }

    // 6. Buscar dados do aluno
    const aluno = await getItem("Alunos", alunoId, alunoId)

    if (!aluno) {
      context.res = errorResponse("Aluno não encontrado", 404)
      return
    }

    // 7. Buscar histórico de conversas (últimas 10 mensagens)
    const historico = await queryItems(
      "LogsDeUso",
      "SELECT TOP 10 * FROM c WHERE c.alunoId = @alunoId AND c.tipo = @tipo ORDER BY c.timestamp DESC",
      [
        { name: "@alunoId", value: alunoId },
        { name: "@tipo", value: "professora-conversa" },
      ]
    )

    // Formatar histórico para OpenAI (inverter ordem)
    const historicoFormatado = historico.reverse().map((h) => ({
      role: h.dados.role,
      content: h.dados.content,
    }))

    // 8. Construir contexto completo
    const contextoCompleto = {
      aluno: {
        nome: aluno.nome,
        idade: aluno.idade,
        serie: aluno.serie,
      },
      materia: contexto?.materia,
      topico: contexto?.topico,
      dificuldades: aluno.dificuldades.map((d) => d.topico),
      historico: historicoFormatado,
    }

    // 9. Chamar OpenAI (Tia Dora)
    const inicio = Date.now()
    const resultado = await perguntarTiaDora(pergunta, contextoCompleto)
    const tempoResposta = Date.now() - inicio

    if (resultado.erro) {
      context.log.error("Erro na resposta da Tia Dora:", resultado.mensagemErro)
      context.res = errorResponse(resultado.resposta, 500)
      return
    }

    // 10. Salvar pergunta no histórico
    await createItem("LogsDeUso", {
      id: `log-${Date.now()}-${uuidv4()}`,
      alunoId,
      tipo: "professora-conversa",
      timestamp: new Date().toISOString(),
      dados: {
        role: "user",
        content: pergunta,
        materia: contexto?.materia,
        topico: contexto?.topico,
      },
    })

    // 11. Salvar resposta no histórico
    await createItem("LogsDeUso", {
      id: `log-${Date.now()}-${uuidv4()}`,
      alunoId,
      tipo: "professora-conversa",
      timestamp: new Date().toISOString(),
      dados: {
        role: "assistant",
        content: resultado.resposta,
        modelo: resultado.modelo,
        tokensUsados: resultado.tokensUsados,
        tempoRespostaMs: tempoResposta,
      },
    })

    // 12. Log de interação geral
    await logInteraction(alunoId, "professora-pergunta", {
      pergunta: pergunta.substring(0, 200),
      tempoRespostaMs: tempoResposta,
      tokensUsados: resultado.tokensUsados,
      materia: contexto?.materia,
    })

    // 13. Atualizar conquistas de gamificação
    // (A criança ganhou pontos por usar a ajuda da professora)

    // 14. Resposta de sucesso
    context.res = successResponse({
      resposta: resultado.resposta,
      tiaDora: {
        nome: "Tia Dora",
        emoji: "🎀",
        saudacao: "Oi querido! Como posso te ajudar hoje?",
      },
      metadata: {
        tokensUsados: resultado.tokensUsados,
        tempoRespostaMs: tempoResposta,
        modelo: resultado.modelo,
      },
      rateLimitInfo: {
        perguntasRestantes: rateLimit.remaining,
        resetaEm: new Date(rateLimit.resetTime).toISOString(),
      },
    })

    context.log("Tia Dora respondeu com sucesso em", tempoResposta, "ms")
  } catch (error) {
    handleError(context, error)
  }
}
