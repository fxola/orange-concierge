Feature: Edit recommendation drafts

  Authors must be able to fix draft wording before submitting for review.

  Scenario: Consultant edits a draft recommendation
    Given a draft recommendation exists
    When the consultant edits the draft title, summary, and priority
    Then the draft keeps draft status
    And the edited title, summary, and priority are saved
    And a recommendation edited audit event is recorded without sensitive text

  Scenario: Reviewer cannot edit a draft recommendation
    Given a draft recommendation exists
    When the reviewer edits the draft title
    Then unauthorized recommendation edit failure is returned
    And the draft title, summary, and priority are unchanged
    And no recommendation edited audit event is recorded

  Scenario: Pending recommendation cannot be edited
    Given a pending review recommendation exists
    When the consultant edits the draft title
    Then invalid recommendation transition failure is returned
    And the recommendation remains pending review
    And no recommendation edited audit event is recorded

  Scenario: Edit with an invalid recommendation id fails
    Given a draft recommendation exists
    When the consultant edits with an invalid recommendation id
    Then invalid recommendation id failure is returned
    And the draft title, summary, and priority are unchanged
    And no recommendation edited audit event is recorded

  Scenario: Edit of a missing recommendation fails
    Given a draft recommendation exists
    When the consultant edits a missing recommendation
    Then recommendation not found failure is returned
    And the draft title, summary, and priority are unchanged
    And no recommendation edited audit event is recorded

  Scenario: Edit with a blank title fails
    Given a draft recommendation exists
    When the consultant edits the draft with a blank title
    Then invalid recommendation edit failure is returned
    And the draft title, summary, and priority are unchanged
    And no recommendation edited audit event is recorded

  Scenario: Edit with an over-length summary fails
    Given a draft recommendation exists
    When the consultant edits the draft with an over-length summary
    Then invalid recommendation edit failure is returned
    And the draft title, summary, and priority are unchanged
    And no recommendation edited audit event is recorded

  Scenario: Edit rolls back when audit recording fails
    Given a draft recommendation exists
    And transactional audit recording fails
    When the consultant edits the draft title, summary, and priority
    Then recommendation edit failure is returned
    And the draft title, summary, and priority are unchanged
    And no recommendation edited audit event is recorded
