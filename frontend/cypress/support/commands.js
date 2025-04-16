function loginViaAuth0Ui(username, password) {

  cy.visit('http://localhost:5173/')
  cy.get('.header').contains('Habbit Hero')
  cy.get('#login').contains('Login').click()

  cy.origin(
    Cypress.env('auth0_domain'),
    { args: { username, password } },
    ({ username, password }) => {
      cy.get('input#username').type(username)
      cy.get('input#password').type(password, { log: false })
      cy.contains('button[value=default]', 'Continue').click()
    }
  )
  cy.url().should('equal', 'http://localhost:5173/')
}

Cypress.Commands.add('loginToAuth0', (username, password) => {

  const log = Cypress.log({
    displayName: 'AUTH0 LOGIN',
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  })
  log.snapshot('before')

  cy.session(
    `${username}`,
    () => {
      loginViaAuth0Ui(username, password)
    },
    {
      validate: () => {
        cy.getCookie(`auth0.${Cypress.env('auth0_client_id')}.is.authenticated`).should('exist')
      },
    }
  )

  log.snapshot('after')
  log.end()
})

Cypress.Commands.add('resetDatabase', () => {
  cy.request('POST', 'http://localhost:3000/tasks_reset');
  cy.request('POST', 'http://localhost:3000/users_reset');
});
