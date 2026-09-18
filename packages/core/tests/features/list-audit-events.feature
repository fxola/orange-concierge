Feature: View audit events

  Reviewers and admins must be able to inspect the audit trail to verify
  the human review workflow without seeing sensitive content.

  Scenario: Reviewer views recent audit events newest-first
    Given interaction submitted, reviewed, and edited audit events exist
    When the reviewer views audit events
    Then audit events are returned newest-first

  Scenario: Admin can view audit events
    Given interaction submitted, reviewed, and edited audit events exist
    When the admin views audit events
    Then all three audit events are returned

  Scenario: Consultant cannot view audit events
    Given interaction submitted, reviewed, and edited audit events exist
    When the consultant views audit events
    Then unauthorized audit view failure is returned
    And no audit events are read

  Scenario: Action filter narrows audit events
    Given interaction submitted, reviewed, and edited audit events exist
    When the reviewer views audit events filtered by recommendation reviewed
    Then only the recommendation reviewed event is returned

  Scenario: Total counts all matching events across pages
    Given interaction submitted, reviewed, and edited audit events exist
    When the reviewer views audit events with a two event page
    Then two events are returned with a total of three

  Scenario: Invalid pagination fails
    Given interaction submitted, reviewed, and edited audit events exist
    When the reviewer views audit events with invalid pagination
    Then invalid pagination failure is returned
    And no audit events are read

  Scenario: Invalid action filter fails
    Given interaction submitted, reviewed, and edited audit events exist
    When the reviewer views audit events with an invalid action filter
    Then invalid audit filter failure is returned
    And no audit events are read
