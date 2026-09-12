Feature: Readiness scoring

  Scenario: Score complete custody and security facts deterministically
    Given extracted facts with a custody arrangement and security controls
    When readiness is scored twice
    Then both scores are identical
    And the overall readiness is ready
    And the rationale explains the custody and security signals

  Scenario: Reduce readiness for unresolved custody and security risks
    Given extracted facts with custody concerns and security risks
    When readiness is scored
    Then the overall readiness needs attention
    And the rationale explains the unresolved risks
