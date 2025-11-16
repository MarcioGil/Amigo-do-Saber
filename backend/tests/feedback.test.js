const request = require('supertest');
const nock = require('nock');
const app = require('../Feedback/index');

describe('Feedback Function', () => {
  beforeAll(() => {
    // Mock Cosmos DB
    nock('https://mock-cosmos-db')
      .persist()
      .post(/.*/)
      .reply(200, { id: 'mocked' });
  });

  it('should create feedback (POST)', async () => {
    const req = { method: 'POST', body: { nome: 'Teste', mensagem: 'Ótimo!', idioma: 'pt' } };
    const context = {};
    await app(context, req);
    expect(context.res.status).toBe(201);
    expect(context.res.body.feedback.mensagem).toBe('Ótimo!');
  });

  it('should list feedbacks (GET)', async () => {
    const req = { method: 'GET', query: { idioma: 'pt' } };
    const context = {};
    await app(context, req);
    expect(context.res.status).toBe(200);
    expect(Array.isArray(context.res.body)).toBe(true);
  });
});
