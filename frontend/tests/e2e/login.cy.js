describe('Fluxo de Login Demo', () => {
  it('Deve acessar a página de login e realizar login demo', () => {
    cy.visit('/login.html');
    cy.get('input[name="username"]').type('demo');
    cy.get('input[name="password"]').type('demo123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/student-area.html');
  });
});
