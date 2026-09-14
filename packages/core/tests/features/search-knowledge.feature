Feature: Search knowledge

  Scenario: Retrieve ranked guidance with source context
    Given internal custody guidance has been indexed
    When knowledge is searched for self-custody readiness
    Then the matching guidance chunk is returned with source context

  Scenario: Reject blank search query without touching the retriever
    Given internal custody guidance has been indexed
    When knowledge is searched with a blank query
    Then the request is rejected as an invalid knowledge search query
    And the knowledge retriever is never queried

  Scenario: Reject invalid result limit without touching the retriever
    Given internal custody guidance has been indexed
    When knowledge is searched with an invalid result limit
    Then the request is rejected as an invalid knowledge search limit
    And the knowledge retriever is never queried
