
/// <reference types="cypress" />
describe('example to-do app', () => {
  beforeEach(() => {
    cy.resetDatabase()
    cy.loginToAuth0(
      Cypress.env('auth0_username_1'),
      Cypress.env('auth0_password_1'),
    )
  })

  it('displays main page', () => {

    /* Verify that the main page is the autheticated one */
    openHomePage()
  });

  it('displays habbits page and create a new habbit', () => {

    openHomePage()
    createNewHabbit('Test task 1', 'Test task 1 description', '2026-10-31')

    /* Verify that the new habbit is displayed on the main page */
    cy.get('.task-container >> .title').contains('Test task 1')
  })

  it('fills in the user details for a user', () => {

    /* Verify that the main page is the autheticated one */
    cy.loginToAuth0(Cypress.env('auth0_username_1'), Cypress.env('auth0_password_1'))
    fillInUserFormAndSubmit('Test User 1', Cypress.env('auth0_username_1'), 'testuser1')
  })

  it('users create friendship and share a single task', () => {

    /* Verify that the main page is the autheticated one */
    cy.loginToAuth0(Cypress.env('auth0_username_1'), Cypress.env('auth0_password_1'))
    fillInUserFormAndSubmit('Test User 1', Cypress.env('auth0_username_1'), 'testuser1')
    createNewHabbit('Test task 1', 'Test task 1 description', '2026-10-31')

    cy.loginToAuth0(Cypress.env('auth0_username_2'), Cypress.env('auth0_password_2'))
    fillInUserFormAndSubmit('Test User 2', Cypress.env('auth0_username_2'), 'testuser2')
    inviteFriendAndSubmit('testuser1')

    /* As User 1, check that the invitation is received and accept it */
    cy.loginToAuth0(Cypress.env('auth0_username_1'), Cypress.env('auth0_password_1'))
    openHomePage()

    cy.get('#friends').should('exist').click()
    cy.get('#invitations-received').should('exist')
    cy.get('#invitations-received >> label.switch:first').should('exist').click()

    cy.get('#friends-list').should('exist')
    cy.get('#friends-list > li').should('exist')
    cy.get('#friends-list > li:first').contains('testuser2')

    /* Invite the user 2 to a habbit  of user 1 */
    cy.get('#home').should('exist').click()
    cy.url().should('equal', 'http://localhost:5173/')

    cy.get('.task-container >> .title').contains('Test task 1')
    cy.get('#invite').should('exist').click()

    cy.get('.friend > div > .clickable').should('exist').click()

    /* Check as user 2 that he can see shared habbit from user 1 */
    cy.loginToAuth0(Cypress.env('auth0_username_2'), Cypress.env('auth0_password_2'))
    openHomePage()
    cy.get('.task-container >> .title').contains('Test task 1')

  })


})

function createNewHabbit(name, description, dueDate) {

  cy.get('#new').contains('New').click()
  cy.url().should('equal', 'http://localhost:5173/edit')

  cy.get('#taskName').type(name)
  cy.get('#taskDescription').type(description)
  cy.get('#taskType').select('habbit')
  cy.get('#repeatsPer').select('days_in_week')
  cy.get('#taskDueDate').type(dueDate)

  cy.get('.days-in-week-selector .day:first-of-type').click()
  cy.get('.days-in-week-selector .day:nth-of-type(3)').click()
  cy.get('.days-in-week-selector .day:nth-of-type(4)').click()

  cy.get('#saveTaskDataAction').click()

  /* Make sure that we are redirected to the main page */
  cy.url().should('equal', 'http://localhost:5173/')
}

function openHomePage() {
  cy.visit('http://localhost:5173/')
  cy.get('.header').contains('Habbit Hero')
  cy.get('#logout', {timeout: Cypress.env('login_timeout')}).contains('Logout')
}

function inviteFriendAndSubmit(nickname) {
  cy.get('#invite-friend').should('exist').type(nickname)
  cy.get('#send-invite-btn').should('exist').click()

  cy.get('li.invited-user-nickname:first').should('exist')
  cy.get('li.invited-user-nickname:first').contains(nickname)
}

function fillInUserFormAndSubmit(name, email, nickname) {
  cy.visit('http://localhost:5173/')
  cy.get('.header').contains('Habbit Hero')
  cy.get('#logout', {timeout: 15000}).contains('Logout')

  cy.get('#friends').click()
  cy.url().should('equal', 'http://localhost:5173/userprofile')
  cy.get('#name').type(name)
  cy.get('#email').type(email)
  cy.get('#nickname').type(nickname)

  cy.get('#submit').click()
  cy.url().should('equal', 'http://localhost:5173/friends')

  cy.get('#invite-friend').should('exist')
}
