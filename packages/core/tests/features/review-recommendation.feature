Feature: Review recommendations

  AI recommendations must pass through human-controlled review before they can be approved.

  Scenario: Consultant submits a draft recommendation for review
    Given a draft recommendation exists
    When the consultant submits the recommendation for review
    Then the recommendation becomes pending review
    And no reviewer identity is recorded

  Scenario: Consultant cannot approve a pending recommendation
    Given a pending review recommendation exists
    When the consultant approves the recommendation
    Then unauthorized recommendation review failure is returned
    And the recommendation remains pending review
    And no recommendation reviewed audit event is recorded

  Scenario: Reviewer approves a pending recommendation
    Given a pending review recommendation exists
    When the reviewer approves the recommendation
    Then the recommendation is approved
    And the reviewer identity and review timestamp are recorded
    And a recommendation reviewed audit event is recorded without sensitive text

  Scenario: Review approval rolls back when audit recording fails
    Given a pending review recommendation exists
    And transactional audit recording fails
    When the reviewer approves the recommendation
    Then recommendation review failure is returned
    And the recommendation remains pending review
    And no recommendation reviewed audit event is recorded

  Scenario: Reviewer rejects a pending recommendation
    Given a pending review recommendation exists
    When the reviewer rejects the recommendation
    Then the recommendation is rejected
    And the reviewer identity and review timestamp are recorded
    And a recommendation reviewed audit event is recorded without sensitive text

  Scenario: Draft recommendation cannot be approved directly
    Given a draft recommendation exists
    When the reviewer approves the recommendation
    Then invalid recommendation transition failure is returned
    And the recommendation remains draft
    And no recommendation reviewed audit event is recorded
