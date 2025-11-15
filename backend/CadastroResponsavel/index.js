// ==============================================
// CADASTRO DE RESPONSÁVEL E ALUNO
// ==============================================

const { v4: uuidv4 } = require("uuid")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { createItem, getAlunoByEmail } = require("../shared/cosmosClient")
const {
  validateInput,
  handleError,
  successResponse,
  errorResponse,
} = require("../shared/middleware")

module.exports = async function (context, req) {
  context.log("Cadastro de Responsável - Início")

  // CORS preflight
  if (req.method === "OPTIONS") {
    context.res = { status: 200, body: "" }
    return
  }

  try {
    // 1. Validar input
    const validation = validateInput(req.body, "cadastroResponsavel")
    if (!validation.valid) {
      context.res = errorResponse("Dados inválidos", 400)
      context.res.body.errors = validation.errors
      return
    }

    const { responsavel, aluno, senha } = validation.value

    // 2. Verificar se email já existe
    const existingAlunos = await getAlunoByEmail(responsavel.email)
    if (existingAlunos.length > 0) {
      context.res = errorResponse("Email já cadastrado", 409)
      return
    }

    // 3. Hash da senha
    const passwordHash = crypto
      .createHash("sha256")
      .update(senha + process.env.JWT_SECRET)
      .digest("hex")

    // 4. Calcular idade do aluno
    const dataNascimento = new Date(aluno.dataNascimento)
    const hoje = new Date()
    let idade = hoje.getFullYear() - dataNascimento.getFullYear()
    const mes = hoje.getMonth() - dataNascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
      idade--
    }

    // 5. Criar documento do aluno
    const alunoId = uuidv4()
    const alunoDoc = {
      id: alunoId,
      nome: aluno.nome,
      dataNascimento: aluno.dataNascimento,
      idade,
      serie: aluno.serie,
      escola: aluno.escola || "",
      responsavel: {
        nome: responsavel.nome,
        email: responsavel.email,
        telefone: responsavel.telefone,
        parentesco: responsavel.parentesco,
        passwordHash,
      },
      materias: aluno.materias,
      livrosDidaticos: aluno.livrosDidaticos || [],
      dificuldades: [],
      preferencias: {
        tipoAtividade: [],
        horarioEstudo: [],
        acessibilidade: {
          leitorDeTela: false,
          altoContraste: false,
          tamanhoFonte: "medio",
        },
      },
      statusAtivo: true,
      dataCriacao: new Date().toISOString(),
      ultimoAcesso: new Date().toISOString(),
    }

    // 6. Salvar no Cosmos DB
    await createItem("Alunos", alunoDoc)

    // 7. Criar documento inicial de gamificação
    const gamificacaoDoc = {
      id: uuidv4(),
      alunoId,
      pontuacao: {
        total: 0,
        porMateria: {},
      },
      nivel: {
        atual: 1,
        nome: "Iniciante",
        proximoNivel: 2,
        pontosParaProximo: 100,
        porcentagem: 0,
      },
      badges: [],
      missoesDiarias: [],
      streak: {
        atual: 0,
        melhor: 0,
        ultimoDia: null,
      },
      conquistas: {
        exerciciosCompletos: 0,
        horasEstudo: 0,
        ajudasProfessora: 0,
        jogosJogados: 0,
      },
      ranking: {
        posicaoGlobal: null,
        posicaoSerie: null,
      },
      ultimaAtualizacao: new Date().toISOString(),
    }

    await createItem("Gamificacao", gamificacaoDoc)

    // 8. Gerar token JWT
    const token = jwt.sign(
      {
        alunoId,
        email: responsavel.email,
        nome: aluno.nome,
        tipo: "responsavel",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    // 9. Resposta de sucesso
    context.res = successResponse(
      {
        aluno: {
          id: alunoId,
          nome: aluno.nome,
          idade,
          serie: aluno.serie,
        },
        responsavel: {
          nome: responsavel.nome,
          email: responsavel.email,
        },
        token,
      },
      201
    )

    context.log("Cadastro concluído com sucesso:", alunoId)
  } catch (error) {
    handleError(context, error)
  }
}
