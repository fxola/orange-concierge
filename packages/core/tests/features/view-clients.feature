Feature: View clients

  Scenario: Consultant lists clients
    Given a consultant actor
    And two known clients exist
    When the consultant lists clients
    Then both clients are returned

  Scenario: Consultant opens a known client
    Given a consultant actor
    And two known clients exist
    When the consultant opens the first client
    Then that client is returned

  Scenario: Consultant opens an unknown client
    Given a consultant actor
    And two known clients exist
    When the consultant opens an unknown client
    Then the request is rejected as client not found

  Scenario: Reject blank client id without touching the repository
    Given a consultant actor
    And two known clients exist
    When the consultant opens a blank client id
    Then the request is rejected as invalid client id
    And the client repository is never queried

  Scenario: Reject whitespace-only client id without touching the repository
    Given a consultant actor
    And two known clients exist
    When the consultant opens a whitespace-only client id
    Then the request is rejected as invalid client id
    And the client repository is never queried

  Scenario: Reject overlong client id without touching the repository
    Given a consultant actor
    And two known clients exist
    When the consultant opens an overlong client id
    Then the request is rejected as invalid client id
    And the client repository is never queried

  Scenario: Reject invalid pagination without touching the repository
    Given a consultant actor
    And two known clients exist
    When the consultant lists clients with invalid pagination
    Then the request is rejected as invalid pagination
    And the client repository is never queried
