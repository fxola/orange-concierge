import { expect } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';

import { calculateReadinessScore, type ExtractedFacts, type ReadinessScore } from '../../src';

const feature = await loadFeature('tests/features/readiness-scoring.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario(
    'Score complete custody and security facts deterministically',
    ({ Given, When, Then, And }) => {
      let facts: ExtractedFacts;
      let firstScore: ReadinessScore;
      let secondScore: ReadinessScore;

      Given('extracted facts with a custody arrangement and security controls', () => {
        facts = {
          custody: {
            currentArrangement: 'Client uses collaborative multisig custody.',
            assetsDiscussed: ['BTC treasury reserve'],
          },
          cybersecurity: {
            controls: ['Uses hardware wallets', 'Requires password manager for shared accounts'],
          },
        };
      });

      When('readiness is scored twice', () => {
        firstScore = calculateReadinessScore(facts);
        secondScore = calculateReadinessScore(facts);
      });

      Then('both scores are identical', () => {
        expect(secondScore).toEqual(firstScore);
      });

      And('the overall readiness is ready', () => {
        expect(firstScore.overall).toEqual(
          expect.objectContaining({ score: 80, level: 'ready' })
        );
      });

      And('the rationale explains the custody and security signals', () => {
        expect(firstScore.custody.rationale).toEqual(
          expect.arrayContaining([
            'Custody arrangement is documented.',
            'Assets under discussion are identified.',
          ])
        );
        expect(firstScore.cybersecurity.rationale).toEqual(
          expect.arrayContaining(['Security controls are documented.'])
        );
      });
    }
  );

  Scenario(
    'Reduce readiness for unresolved custody and security risks',
    ({ Given, When, Then, And }) => {
      let facts: ExtractedFacts;
      let score: ReadinessScore;

      Given('extracted facts with custody concerns and security risks', () => {
        facts = {
          custody: {
            concerns: ['Client worries one signer can lose a key'],
          },
          cybersecurity: {
            risks: ['Shared email account lacks phishing controls'],
            incidentHistory: 'Client reported a prior SIM-swap attempt.',
          },
        };
      });

      When('readiness is scored', () => {
        score = calculateReadinessScore(facts);
      });

      Then('the overall readiness needs attention', () => {
        expect(score.overall).toEqual(
          expect.objectContaining({ score: 18, level: 'needs_attention' })
        );
      });

      And('the rationale explains the unresolved risks', () => {
        expect(score.custody.rationale).toEqual(
          expect.arrayContaining(['Unresolved custody concerns were raised.'])
        );
        expect(score.cybersecurity.rationale).toEqual(
          expect.arrayContaining([
            'Security risks were identified.',
            'Incident history needs review.',
          ])
        );
      });
    }
  );
});
