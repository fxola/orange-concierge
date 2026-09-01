Feature: Core behavior spec harness

  Scenario: Load a Gherkin scenario
    Given the core package has a behavior spec
    When the spec is executed
    Then Vitest runs the scenario
