const request = require('supertest');
const nock = require('nock');

// Exemplo de teste de integração para DELETE /aluno/:id

describe('DELETE /aluno/:id', () => {
  beforeAll(() => {
    // Mock Cosmos DB
    nock('https://fake-cosmos-db-endpoint')
      .delete(/.*/)
      .reply(200, { result: 'deleted' });
  });

  it('should delete or anonymize student data', async () => {
    // Simulação de chamada à função Azure
    // request(app) depende do seu setup, ajuste conforme necessário
    const res = await request('http://localhost:7071')
      .delete('/api/aluno/123');
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe('deleted');
  });
});
