// ==============================================
// COSMOS DB CLIENT - Singleton
// ==============================================

const { CosmosClient } = require("@azure/cosmos");

let client = null;
let database = null;
let containers = {};

function getCosmosClient() {
  if (!client) {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;
    
    if (!endpoint || !key) {
      throw new Error('COSMOS_ENDPOINT and COSMOS_KEY must be set in environment variables');
    }
    
    client = new CosmosClient({ endpoint, key });
  }
  return client;
}

function getDatabase() {
  if (!database) {
    const client = getCosmosClient();
    const databaseId = process.env.COSMOS_DATABASE || 'EduDB';
    database = client.database(databaseId);
  }
  return database;
}

function getContainer(containerId) {
  if (!containers[containerId]) {
    const database = getDatabase();
    containers[containerId] = database.container(containerId);
  }
  return containers[containerId];
}

// ==============================================
// CRUD OPERATIONS
// ==============================================

async function createItem(containerId, item) {
  const container = getContainer(containerId);
  const { resource } = await container.items.create(item);
  return resource;
}

async function getItem(containerId, id, partitionKey) {
  const container = getContainer(containerId);
  try {
    const { resource } = await container.item(id, partitionKey).read();
    return resource;
  } catch (error) {
    if (error.code === 404) {
      return null;
    }
    throw error;
  }
}

async function updateItem(containerId, item) {
  const container = getContainer(containerId);
  const { resource } = await container.item(item.id, item.id).replace(item);
  return resource;
}

async function deleteItem(containerId, id, partitionKey) {
  const container = getContainer(containerId);
  await container.item(id, partitionKey).delete();
  return true;
}

async function queryItems(containerId, query, parameters = []) {
  const container = getContainer(containerId);
  const { resources } = await container.items
    .query({
      query: query,
      parameters: parameters
    })
    .fetchAll();
  return resources;
}

// ==============================================
// SPECIALIZED QUERIES
// ==============================================

async function getAlunoByEmail(email) {
  return queryItems('Alunos', 
    'SELECT * FROM c WHERE c.responsavel.email = @email',
    [{ name: '@email', value: email }]
  );
}

async function getProgressoByAluno(alunoId) {
  return queryItems('Progresso',
    'SELECT * FROM c WHERE c.alunoId = @alunoId',
    [{ name: '@alunoId', value: alunoId }]
  );
}

async function getGamificacaoByAluno(alunoId) {
  const items = await queryItems('Gamificacao',
    'SELECT * FROM c WHERE c.alunoId = @alunoId',
    [{ name: '@alunoId', value: alunoId }]
  );
  return items[0] || null;
}

async function logInteraction(alunoId, tipo, dados) {
  const log = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    alunoId,
    tipo,
    timestamp: new Date().toISOString(),
    dados
  };
  return createItem('LogsDeUso', log);
}

// ==============================================
// EXPORTS
// ==============================================

module.exports = {
  getCosmosClient,
  getDatabase,
  getContainer,
  createItem,
  getItem,
  updateItem,
  deleteItem,
  queryItems,
  getAlunoByEmail,
  getProgressoByAluno,
  getGamificacaoByAluno,
  logInteraction
};
