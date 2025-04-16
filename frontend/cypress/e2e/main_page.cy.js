
/// <reference types="cypress" />
describe('example to-do app', () => {
  beforeEach(() => {
    cy.resetDatabase()
    cy.loginToAuth0(
      Cypress.env('auth0_username_1'),
      Cypress.env('auth0_password_1'),
    )
  })

  it.skip('displays main page', () => {

    /* Verify that the main page is the autheticated one */
    cy.visit('http://localhost:5173/')
    cy.get('.header').contains('Habbit Hero')
    cy.get('#logout', {timeout: 15000}).contains('Logout')
  });

  it.skip('displays habbits page and create a new habbit', () => {

    cy.visit('http://localhost:5173/')
    cy.get('#logout', {timeout: 10000}).contains('Logout')

    /* Create a new habbit */
    cy.get('#new').contains('New').click()
    cy.url().should('equal', 'http://localhost:5173/edit')

    cy.get('#taskName').type('Test task 1')
    cy.get('#taskDescription').type('Test task 1 description')
    cy.get('#taskType').select('habbit')
    cy.get('#repeatsPer').select('days_in_week')
    cy.get('#taskDueDate').type('2026-10-31')

    cy.get('.days-in-week-selector .day:first-of-type').click()
    cy.get('.days-in-week-selector .day:nth-of-type(3)').click()
    cy.get('.days-in-week-selector .day:nth-of-type(4)').click()

    cy.get('#saveTaskDataAction').click()

    /* Make sure that we are redirected to the main page */
    cy.url().should('equal', 'http://localhost:5173/')

    /* Verify that the new habbit is displayed on the main page */
    cy.get('.task-container >> .title').contains('Test task 1')
  })

  it('fills in the user details for a user', () => {

    /* Verify that the main page is the autheticated one */
    cy.visit('http://localhost:5173/')
    cy.get('.header').contains('Habbit Hero')
    cy.get('#logout', {timeout: 15000}).contains('Logout')

    cy.get('#friends').click()
    cy.url().should('equal', 'http://localhost:5173/userprofile')
    cy.get('#name').type('Test User 1')
    cy.get('#email').type('test.user.1@example.com')
    cy.get('#nickname').type('testuser1')

    cy.get('#submit').click()
    cy.url().should('equal', 'http://localhost:5173/friends')

    cy.get('#invite-friend').should('exist')
  })
})
