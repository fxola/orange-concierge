Feature: Get interaction

  Scenario: Consultant opens an interaction for the matching client
    Given a consultant actor
    And a received interaction exists for the scoped client
    When the consultant opens that interaction for the scoped client
    Then that interaction is returned

  Scenario: Hide an interaction that belongs to another client
    Given a consultant actor
    And a received interaction exists for another client
    When the consultant opens that interaction for the scoped client
    Then the request is rejected as interaction not found

  Scenario: Reject blank client id without touching the repository
    Given a consultant actor
    When the consultant opens an interaction with a blank client id
    Then the request is rejected as invalid client id
    And the interaction repository is never queried
