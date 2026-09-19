Feature: Generate recommendations

  Scenario: Generate grounded recommendations from completed analysis
    Given an analyzed interaction has extracted facts with transcript evidence
    And relevant internal guidance is retrieved
    And the recommendation drafter returns a cited recommendation
    When recommendations are generated for the interaction
    Then knowledge is retrieved before recommendations are drafted
    And the grounded recommendation is returned with client evidence and knowledge citations

  Scenario: Persist grounded recommendations as draft records
    Given an analyzed interaction has extracted facts with transcript evidence
    And relevant internal guidance is retrieved
    And the recommendation drafter returns a cited recommendation
    When recommendations are generated for the interaction
    Then a draft recommendation is saved with client evidence and knowledge citations
    And the generated recommendation response includes the persisted recommendation id

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

  Scenario: Block generation when evidence coverage is low
    Given an analyzed interaction has low evidence coverage
    And relevant internal guidance is retrieved
    And the recommendation drafter returns a cited recommendation
    When recommendations are generated for the interaction
    Then no grounded recommendations are returned
    And the recommendation drafter is not invoked

  Scenario: Proceed with generation after facts are human-verified
    Given an analyzed interaction has low evidence coverage with verified facts
    And relevant internal guidance is retrieved
    And the recommendation drafter returns a cited recommendation
    When recommendations are generated for the interaction
    Then a grounded recommendation is returned for the verified interaction

  Scenario: Fail when recommendation drafting fails
    Given an analyzed interaction has extracted facts with transcript evidence
    And relevant internal guidance is retrieved
    And the recommendation drafter request fails
    When recommendations are generated for the interaction
    Then recommendation drafting failure is returned
