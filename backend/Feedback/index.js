// Feedback Function: Recebe e lista feedbacks
const { CosmosClient } = require('../shared/cosmosClient');
const DB_NAME = process.env.COSMOS_DB_NAME || 'amigo-do-saber';
const CONTAINER = 'feedbacks';

module.exports = async function (context, req) {
  const client = CosmosClient();
  const container = client.database(DB_NAME).container(CONTAINER);

  if (req.method === 'POST') {
    const { nome, mensagem, idioma } = req.body || {};
    if (!mensagem) {
      context.res = {
        status: 400,
        body: { error: 'Mensagem obrigatória.' }
      };
      return;
    }
    const feedback = {
      nome: nome || 'Anônimo',
      mensagem,
      idioma: idioma || 'pt',
      data: new Date().toISOString()
    };
    await container.items.create(feedback);
    context.res = {
      status: 201,
      body: { success: true, feedback }
    };
    return;
  }

  // GET: lista feedbacks
  if (req.method === 'GET') {
    const idioma = req.query.idioma || 'pt';
    const { resources } = await container.items
      .query(`SELECT * FROM c WHERE c.idioma = @idioma ORDER BY c.data DESC`, {
        parameters: [{ name: '@idioma', value: idioma }]
      })
      .fetchAll();
    context.res = {
      status: 200,
      body: resources
    };
    return;
  }

  context.res = {
    status: 405,
    body: { error: 'Método não permitido.' }
  };
};
