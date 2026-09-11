Feature: List interactions

  Scenario: Consultant lists a client's interactions
    Given a consultant actor
    And a client with interactions from another client mixed in
    When the consultant lists the client's interactions
    Then only that client's interactions are returned

  Scenario: Consultant lists interactions for an unknown client
    Given a consultant actor
    When the consultant lists interactions for an unknown client
    Then the request is rejected as client not found

  Scenario: Reject blank client id without touching the repository
    Given a consultant actor
    When the consultant lists interactions for a blank client id
    Then the request is rejected as invalid client id
    And the client repository is never queried

  Scenario: Reject invalid pagination without touching the repository
    Given a consultant actor
    When the consultant lists interactions with invalid pagination
    Then the request is rejected as invalid pagination
    And the client repository is never queried
