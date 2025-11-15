const competenciasBNCC = [
  {
    serie: "1º Ano",
    area: "Matemática",
    codigo: "EF01MA01",
    descricao: "Utilizar números naturais em situações do cotidiano."
  },
  {
    serie: "5º Ano",
    area: "Ciências",
    codigo: "EF05CI07",
    descricao: "Compreender o ciclo da água."
  }
  // Adicione mais exemplos se quiser
]

module.exports = async function (context, req) {
  const { serie, area } = req.query
  let resultado = competenciasBNCC

  if (serie) {
    resultado = resultado.filter(c => c.serie === serie)
  }
  if (area) {
    resultado = resultado.filter(c => c.area === area)
  }

  context.res = {
    status: 200,
    body: resultado
  }
}
