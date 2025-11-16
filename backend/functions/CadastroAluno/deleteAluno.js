// Azure Function: DELETE /aluno/:id
const { CosmosClient } = require('@azure/cosmos');
const appInsights = require('../../logging/appInsights');

module.exports = async function (context, req) {
  const alunoId = context.bindingData.id;
  if (!alunoId) {
    context.res = { status: 400, body: { error: 'ID do aluno é obrigatório.' } };
    return;
  }

  // Autenticação/autorização recomendada aqui

  const client = new CosmosClient({
    endpoint: process.env.COSMOS_DB_ENDPOINT,
    key: process.env.COSMOS_DB_KEY
  });
  const database = client.database(process.env.COSMOS_DB_DATABASE);
  const container = database.container('Alunos');

  try {
    // Apagar ou anonimizar dados do aluno
    await container.item(alunoId, alunoId).delete();
    context.res = { status: 200, body: { result: 'deleted' } };
    appInsights.defaultClient.trackEvent({ name: 'AlunoDeleted', properties: { alunoId } });
  } catch (error) {
    context.res = { status: 500, body: { error: 'Erro ao excluir dados.' } };
    appInsights.defaultClient.trackException({ exception: error });
  }
};
