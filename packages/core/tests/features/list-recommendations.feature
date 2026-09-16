Feature: List recommendations

  Scenario: List persisted draft recommendations for an interaction
    Given an analyzed interaction has persisted draft recommendations
    When recommendations are listed for the interaction
    Then the draft recommendations are returned

  Scenario: Listing returns empty when no recommendations exist
    Given an analyzed interaction has no persisted recommendations
    When recommendations are listed for the interaction
    Then no recommendations are returned

  Scenario: Listing excludes superseded recommendations by default
    Given an analyzed interaction has draft and superseded recommendations
    When recommendations are listed for the interaction
    Then only non-superseded recommendations are returned

  Scenario: Listing includes superseded recommendations when requested
    Given an analyzed interaction has draft and superseded recommendations
    When recommendations are listed including superseded for the interaction
    Then all recommendations are returned
