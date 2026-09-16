Feature: List recommendations

  Scenario: List persisted draft recommendations for an interaction
    Given an analyzed interaction has persisted draft recommendations
    When recommendations are listed for the interaction
    Then the draft recommendations are returned

  Scenario: Listing returns empty when no recommendations exist
    Given an analyzed interaction has no persisted recommendations
    When recommendations are listed for the interaction
    Then no recommendations are returned
