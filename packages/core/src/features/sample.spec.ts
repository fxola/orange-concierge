import { expect } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';

const feature = await loadFeature('src/features/sample.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('Load a Gherkin scenario', ({ Given, When, Then }) => {
    let specLoaded = false;

    Given('the core package has a behavior spec', () => {
      specLoaded = true;
    });

    When('the spec is executed', () => {});

    Then('Vitest runs the scenario', () => {
      expect(specLoaded).toBe(true);
    });
  });
});
