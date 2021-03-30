import {
  entityTableSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityCreateButtonSelector,
  entityCreateSaveButtonSelector,
  entityEditButtonSelector,
  entityDeleteButtonSelector,
  entityConfirmDeleteButtonSelector,
} from '../../support/entity';

describe('Ticket e2e test', () => {
  let startingEntitiesCount = 0;

  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear();
    });

    cy.clearCookies();
    cy.intercept('GET', '/api/tickets*').as('entitiesRequest');
    cy.visit('');
    cy.login('admin', 'admin');
    cy.clickOnEntityMenuItem('ticket');
    cy.wait('@entitiesRequest').then(({ request, response }) => (startingEntitiesCount = response.body.length));
    cy.visit('/');
  });

  it('should load Tickets', () => {
    cy.intercept('GET', '/api/tickets*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('ticket');
    cy.wait('@entitiesRequest');
    cy.getEntityHeading('Ticket').should('exist');
    if (startingEntitiesCount === 0) {
      cy.get(entityTableSelector).should('not.exist');
    } else {
      cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount);
    }
    cy.visit('/');
  });

  it('should load details Ticket page', () => {
    cy.intercept('GET', '/api/tickets*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('ticket');
    cy.wait('@entitiesRequest');
    if (startingEntitiesCount > 0) {
      cy.get(entityDetailsButtonSelector).first().click({ force: true });
      cy.getEntityDetailsHeading('ticket');
      cy.get(entityDetailsBackButtonSelector).should('exist');
    }
    cy.visit('/');
  });

  it('should load create Ticket page', () => {
    cy.intercept('GET', '/api/tickets*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('ticket');
    cy.wait('@entitiesRequest');
    cy.get(entityCreateButtonSelector).click({ force: true });
    cy.getEntityCreateUpdateHeading('Ticket');
    cy.get(entityCreateSaveButtonSelector).should('exist');
    cy.visit('/');
  });

  it('should load edit Ticket page', () => {
    cy.intercept('GET', '/api/tickets*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('ticket');
    cy.wait('@entitiesRequest');
    if (startingEntitiesCount > 0) {
      cy.get(entityEditButtonSelector).first().click({ force: true });
      cy.getEntityCreateUpdateHeading('Ticket');
      cy.get(entityCreateSaveButtonSelector).should('exist');
    }
    cy.visit('/');
  });

  it('should create an instance of Ticket', () => {
    cy.intercept('GET', '/api/tickets*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('ticket');
    cy.wait('@entitiesRequest').then(({ request, response }) => (startingEntitiesCount = response.body.length));
    cy.get(entityCreateButtonSelector).click({ force: true });
    cy.getEntityCreateUpdateHeading('Ticket');

    cy.get(`[data-cy="title"]`)
      .type('hard hacking withdrawal', { force: true })
      .invoke('val')
      .should('match', new RegExp('hard hacking withdrawal'));

    cy.get(`[data-cy="description"]`)
      .type('Keyboard up Buckinghamshire', { force: true })
      .invoke('val')
      .should('match', new RegExp('Keyboard up Buckinghamshire'));

    cy.get(`[data-cy="dueDate"]`).type('2021-03-30').should('have.value', '2021-03-30');

    cy.get(`[data-cy="done"]`).should('not.be.checked');
    cy.get(`[data-cy="done"]`).click().should('be.checked');
    cy.setFieldSelectToLastOfEntity('project');

    cy.setFieldSelectToLastOfEntity('assignedTo');

    cy.setFieldSelectToLastOfEntity('label');

    cy.get(entityCreateSaveButtonSelector).click({ force: true });
    cy.scrollTo('top', { ensureScrollable: false });
    cy.get(entityCreateSaveButtonSelector).should('not.exist');
    cy.intercept('GET', '/api/tickets*').as('entitiesRequestAfterCreate');
    cy.visit('/');
    cy.clickOnEntityMenuItem('ticket');
    cy.wait('@entitiesRequestAfterCreate');
    cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount + 1);
    cy.visit('/');
  });

  it('should delete last instance of Ticket', () => {
    cy.intercept('GET', '/api/tickets*').as('entitiesRequest');
    cy.intercept('DELETE', '/api/tickets/*').as('deleteEntityRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('ticket');
    cy.wait('@entitiesRequest').then(({ request, response }) => {
      startingEntitiesCount = response.body.length;
      if (startingEntitiesCount > 0) {
        cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount);
        cy.get(entityDeleteButtonSelector).last().click({ force: true });
        cy.getEntityDeleteDialogHeading('ticket').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click({ force: true });
        cy.wait('@deleteEntityRequest');
        cy.intercept('GET', '/api/tickets*').as('entitiesRequestAfterDelete');
        cy.visit('/');
        cy.clickOnEntityMenuItem('ticket');
        cy.wait('@entitiesRequestAfterDelete');
        cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount - 1);
      }
      cy.visit('/');
    });
  });
});
