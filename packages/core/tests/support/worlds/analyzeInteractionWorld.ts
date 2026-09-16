import { AnalyzeInteraction, type Actor, type Interaction } from '../../../src';
import type { SecretFinding } from '../../../src/ports/secret-scanner';
import { RecordingAudit } from '../in-memory-adapters/inMemoryAuditPort';
import { InMemoryInteractionRepository } from '../in-memory-adapters/inMemoryInteractionRepository';
import { RecordingSecretScanner } from '../in-memory-adapters/inMemorySecretScannerAdapter';
import { RecordingStructuredLLM } from '../in-memory-adapters/inMemoryStructuredLLMAdapter';
import { InMemoryTransactionManager } from '../in-memory-adapters/inMemoryTransactionManager';

const safeTranscript = [
  'Consultant: Hi Sarah, thanks for joining today. You mentioned wanting to move your bitcoin off the exchange?',
  'Client: Yeah, I have been holding about 0.5 BTC on Coinbase for a couple years now. I keep hearing about people losing funds on exchanges and I want to learn how to do self-custody properly.',
  'Consultant: Absolutely. So the first thing we would do is set up a hardware wallet. Have you looked at any devices yet?',
  'Client: I have been looking at the Ledger Nano X. Is that a good choice?',
].join('\n');

const secretTranscript = [
  'Consultant: To restore your wallet, I will need your recovery phrase. Can you read it to me?',
  'Client: Sure, let me paste it here: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"',
  'Consultant: Got it. Let me verify that worked and we can proceed with the restore.',
].join('\n');

const fixedDate = new Date('2026-09-02T00:00:00.000Z');

const consultant: Actor = {
  id: 'consultant-1',
  role: 'consultant',
};

const buildInteraction = (
  transcript: string,
  status: Interaction['status'] = 'received'
): Interaction => ({
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  clientId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  submittedBy: consultant.id,
  status,
  transcript,
  createdAt: fixedDate,
});

const buildSeedPhraseFinding = (): SecretFinding => ({
  type: 'seed_phrase',
  severity: 'prohibited',
  start: 129,
  end: 227,
  label: 'Possible seed phrase',
});

export function analyzeInteractionWorld() {
  let interaction: Interaction | undefined;
  let operations: string[] | undefined;
  let interactionsRepo: InMemoryInteractionRepository | undefined;
  let secretScanner: RecordingSecretScanner | undefined;
  let structuredLLM: RecordingStructuredLLM | undefined;
  let audit: RecordingAudit | undefined;
  let transactionManager: InMemoryTransactionManager | undefined;
  let analyzeInteraction: AnalyzeInteraction | undefined;

  const composeAnalysisFixture = (
    nextInteraction: Interaction,
    findings: readonly SecretFinding[]
  ) => {
    interaction = nextInteraction;
    operations = [];
    interactionsRepo = new InMemoryInteractionRepository(interaction);
    secretScanner = new RecordingSecretScanner({ findings }, operations);
    structuredLLM = new RecordingStructuredLLM(operations);
    audit = new RecordingAudit();
    transactionManager = new InMemoryTransactionManager(interactionsRepo, audit);
    analyzeInteraction = new AnalyzeInteraction({
      interactionsRepo,
      secretScanner,
      structuredLLM,
      audit,
      transactionManager,
      now: () => fixedDate,
    });
  };

  const required = <T>(value: T | undefined, name: string): T => {
    if (value === undefined) {
      throw new Error(`${name} should be set`);
    }

    return value as T;
  };

  return {
    givenReceivedInteractionContainingProhibitedSecret() {
      composeAnalysisFixture(buildInteraction(secretTranscript), [buildSeedPhraseFinding()]);
    },

    givenReceivedInteractionWithSafeTranscript() {
      composeAnalysisFixture(buildInteraction(safeTranscript), []);
    },

    givenInteractionThatIsAlreadyAnalysisCompleted() {
      composeAnalysisFixture(buildInteraction(safeTranscript, 'analysis_completed'), []);
    },

    interaction() {
      const current = interactionsRepo?.getCurrent();
      if (current) return current;
      return required(interaction, 'interaction');
    },

    consultant() {
      return consultant;
    },

    analyzeInteraction() {
      return required(analyzeInteraction, 'analyzeInteraction');
    },

    operations() {
      return required(operations, 'operations');
    },

    secretScanner() {
      return required(secretScanner, 'secretScanner');
    },

    structuredLLM() {
      return required(structuredLLM, 'structuredLLM');
    },

    audit() {
      return required(audit, 'audit');
    },

    interactionsRepo() {
      return required(interactionsRepo, 'interactionsRepo');
    },

    transactionManager() {
      return required(transactionManager, 'transactionManager');
    },

    failTransactionalAuditRecording() {
      required(transactionManager, 'transactionManager').failNextTransactionalAudit();
    },
  };
}
