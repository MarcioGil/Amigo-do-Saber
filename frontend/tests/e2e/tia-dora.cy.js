describe('Fluxo Tia Dora', () => {
  it('Navega e envia feedback', () => {
    cy.visit('/tia-dora.html');
    cy.get('#open-feedback').click();
    cy.get('#feedback-nome').type('Teste');
    cy.get('#feedback-mensagem').type('Ótimo trabalho!');
    cy.get('#feedback-form .send-btn').click();
    cy.contains('Feedback enviado com sucesso!').should('be.visible');
  });
});
