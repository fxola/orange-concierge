Feature: Generate recommendations

  Scenario: Generate grounded recommendations from completed analysis
    Given an analyzed interaction has extracted facts with transcript evidence
    And relevant internal guidance is retrieved
    And the recommendation drafter returns a cited recommendation
    When recommendations are generated for the interaction
    Then knowledge is retrieved before recommendations are drafted
    And the grounded recommendation is returned with client evidence and knowledge citations

  Scenario: Drop recommendation without known knowledge citation
    Given an analyzed interaction has extracted facts with transcript evidence
    And relevant internal guidance is retrieved
    And the recommendation drafter returns a recommendation citing unknown knowledge
    When recommendations are generated for the interaction
    Then no grounded recommendations are returned

  Scenario: Drop recommendation without known client evidence
    Given an analyzed interaction has extracted facts with transcript evidence
    And relevant internal guidance is retrieved
    And the recommendation drafter returns a recommendation citing unknown client evidence
    When recommendations are generated for the interaction
    Then no grounded recommendations are returned

  Scenario: Fail when recommendation drafting fails
    Given an analyzed interaction has extracted facts with transcript evidence
    And relevant internal guidance is retrieved
    And the recommendation drafter request fails
    When recommendations are generated for the interaction
    Then recommendation drafting failure is returned
