Feature: Analyze interaction

  Scenario: Block prohibited secrets before model invocation
    Given a received interaction containing a prohibited secret
    When a consultant analyzes the interaction
    Then the secret scanner runs before any structured LLM call
    And the structured LLM is not invoked
    And the interaction is marked analysis blocked
    And the blocked audit event does not include transcript content

  Scenario: Complete analysis for a safe received interaction
    Given a received interaction with safe transcript
    When a consultant analyzes the interaction
    Then the secret scanner runs before the structured LLM
    And the structured LLM receives the interaction transcript
    And the interaction is marked analysis completed
    And the analysis audit events do not include transcript content
    
  Scenario: Reject an actor who cannot analyze interactions
    Given a received interaction with safe transcript
    When a reviewer analyzes the interaction
    Then the analysis is rejected as unauthorized
    And the secret scanner is not invoked
    And the structured LLM is not invoked
    And no audit event includes transcript content

  Scenario: Report a missing interaction without side effects
    Given no interaction exists for the requested id
    When a consultant analyzes the interaction
    Then the analysis is rejected as interaction not found
    And the secret scanner is not invoked
    And the structured LLM is not invoked
    And no audit event is recorded

  Scenario: Complete analysis when the scanner returns warnings only
    Given a received interaction with warning-only scanner findings
    When a consultant analyzes the interaction
    Then the structured LLM is invoked
    And the interaction is marked analysis completed
    And the audit events include warning counts without transcript content

  Scenario: Record model failure without leaking transcript content
    Given a received interaction with safe transcript
    And the structured LLM fails during extraction
    When a consultant analyzes the interaction
    Then the interaction is not marked analysis completed
    And an analysis failed audit event is recorded without transcript content

  Scenario: Refuse to re-analyze an interaction that is not received
    Given an interaction that is already analysis completed
    When a consultant analyzes the interaction
    Then the analysis is rejected as an invalid interaction state
    And the secret scanner is not invoked
    And the structured LLM is not invoked
