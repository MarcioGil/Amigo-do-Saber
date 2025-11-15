module.exports = async function (context, req) {
  // Exemplo simples: resposta do bot conselheiro
  const { pergunta } = req.body || {}
  if (!pergunta) {
    context.res = { status: 400, body: "Pergunta não informada." }
    return
  }
  context.res = {
    status: 200,
    body: { resposta: `Conselho: Sempre estude com dedicação e respeite seus colegas!` }
  }
}
