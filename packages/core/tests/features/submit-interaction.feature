Feature: Submit interaction

  Scenario: Consultant submits meeting notes
    Given a consultant actor
    When the consultant submits meeting notes for a client
    Then a received interaction is saved
    And the interaction belongs to the client
    And the interaction was submitted by the consultant
    And an interaction submitted audit event is recorded
    And the audit event does not include transcript content

  Scenario: Reject blank transcript without side effects
    Given a consultant actor
    When the consultant submits blank meeting notes for a client
    Then the submission is rejected as blank transcript
    And no interaction is saved
    And no audit event is recorded

  Scenario: Reject whitespace-only transcript as blank
    Given a consultant actor
    When the consultant submits whitespace-only meeting notes for a client
    Then the submission is rejected as blank transcript
    And no interaction is saved
    And no audit event is recorded

  Scenario: Reject unauthorized submitter without side effects
    Given a reviewer actor
    When the reviewer submits meeting notes for a client
    Then the submission is rejected as unauthorized
    And no interaction is saved
    And no audit event is recorded

  Scenario: Fail transactionally when audit recording fails
    Given a consultant actor
    And audit recording fails
    When the consultant submits meeting notes for a client
    Then the submission is rejected as submission failed
    And no interaction is saved
