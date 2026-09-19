Feature: Verify interaction facts

  Consultants confirm unsourced facts after checking them against the transcript.

  Scenario: Reviewer cannot verify interaction facts
    Given an analyzed interaction exists
    When the reviewer verifies a fact path
    Then unauthorized verify facts failure is returned
    And the verification set is unchanged
    And no facts verified audit event is recorded

  Scenario: Verify with an invalid interaction id fails
    Given an analyzed interaction exists
    When the consultant verifies with an invalid interaction id
    Then invalid interaction id failure is returned

  Scenario: Verify a missing interaction fails
    Given no interaction exists for the requested id
    When the consultant verifies a fact path
    Then interaction not found failure is returned

  Scenario: Verify an interaction that is not analysis completed fails
    Given a received interaction exists
    When the consultant verifies a fact path
    Then invalid interaction state failure is returned

  Scenario: Verify with an unknown fact path fails
    Given an analyzed interaction exists
    When the consultant verifies a mix of known and unknown fact paths
    Then invalid fact path failure is returned
    And the verification set is unchanged

  Scenario: Consultant saves deduplicated sorted paths and records an audit event
    Given an analyzed interaction exists
    When the consultant verifies deduplicated fact paths
    Then the deduplicated sorted paths are saved
    And a facts verified audit event is recorded

  Scenario: Consultant replaces the previous verification set, including clearing it
    Given an analyzed interaction with a verified fact exists
    When the consultant clears the verification set
    Then the verification set is empty

  Scenario: Verify rolls back when audit recording fails
    Given an analyzed interaction exists
    And transactional audit recording fails
    When the consultant verifies a fact path
    Then fact verification failure is returned
    And the verification set is unchanged
    And no facts verified audit event is recorded
