module.exports = async function (context, req) {
  // Exemplo simples: geração de exercício personalizado
  const { materia } = req.body || {}
  if (!materia) {
    context.res = { status: 400, body: "Matéria não informada." }
    return
  }
  context.res = {
    status: 200,
    body: { exercicio: `Resolva: 2 + 2 = ? (Matéria: ${materia})` }
  }
}
