import { PLACEHOLDER_VALUES } from './constants';
import type {
  AssessmentModelFact,
  AssessmentModelOutput,
  EvidenceReference,
  ExtractedFacts,
} from './schemas';
import { ASSESSMENT_EVIDENCE_MAX_ITEMS } from './schemas';

type EvidencePath = EvidenceReference['factPath'];

type ResolvedFact = Readonly<{
  text: string;
  evidence: EvidenceReference;
}>;

function clean(value: string): string {
  return value.trim();
}

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_VALUES.has(clean(value).toLowerCase());
}

function resolveFact(
  fact: AssessmentModelFact | undefined,
  factPath: EvidencePath,
  transcript: string
): ResolvedFact | null {
  if (!fact) {
    return null;
  }

  const text = clean(fact.text);
  const quote = clean(fact.quote);

  if (text.length === 0 || quote.length === 0) {
    return null;
  }

  if (isPlaceholder(text) || isPlaceholder(quote)) {
    return null;
  }

  const startOffset = transcript.indexOf(quote);
  if (startOffset < 0) {
    return null;
  }

  return {
    text,
    evidence: {
      factPath,
      quote,
      startOffset,
      endOffset: startOffset + quote.length,
    },
  };
}

function mapFactList(
  facts: readonly AssessmentModelFact[] | undefined,
  pathForIndex: (index: number) => EvidencePath,
  transcript: string
): Readonly<{ values: string[]; evidence: EvidenceReference[] }> {
  const values: string[] = [];
  const evidence: EvidenceReference[] = [];

  for (const fact of facts ?? []) {
    const resolved = resolveFact(fact, pathForIndex(values.length), transcript);
    if (!resolved) {
      continue;
    }

    values.push(resolved.text);
    evidence.push(resolved.evidence);
  }

  return { values, evidence };
}

export function mapAssessmentModelOutput(
  output: AssessmentModelOutput,
  transcript: string
): ExtractedFacts {
  const evidence: EvidenceReference[] = [];
  const facts: ExtractedFacts = {};

  const custody: NonNullable<ExtractedFacts['custody']> = {};
  const currentArrangement = resolveFact(
    output.custody?.currentArrangement,
    'custody.currentArrangement',
    transcript
  );
  if (currentArrangement) {
    custody.currentArrangement = currentArrangement.text;
    evidence.push(currentArrangement.evidence);
  }

  const assets = mapFactList(
    output.custody?.assetsDiscussed,
    (index) => `custody.assetsDiscussed[${index}]`,
    transcript
  );
  if (assets.values.length > 0) {
    custody.assetsDiscussed = assets.values;
    evidence.push(...assets.evidence);
  }

  const concerns = mapFactList(
    output.custody?.concerns,
    (index) => `custody.concerns[${index}]`,
    transcript
  );
  if (concerns.values.length > 0) {
    custody.concerns = concerns.values;
    evidence.push(...concerns.evidence);
  }

  if (Object.keys(custody).length > 0) {
    facts.custody = custody;
  }

  const cybersecurity: NonNullable<ExtractedFacts['cybersecurity']> = {};
  const cybersecurityEvidence: EvidenceReference[] = [];

  const controls = mapFactList(
    output.cybersecurity?.controls,
    (index) => `cybersecurity.controls[${index}]`,
    transcript
  );
  if (controls.values.length > 0) {
    cybersecurity.controls = controls.values;
    cybersecurityEvidence.push(...controls.evidence);
  }

  const risks = mapFactList(
    output.cybersecurity?.risks,
    (index) => `cybersecurity.risks[${index}]`,
    transcript
  );
  if (risks.values.length > 0) {
    cybersecurity.risks = risks.values;
    cybersecurityEvidence.push(...risks.evidence);
  }

  const incidentHistory = resolveFact(
    output.cybersecurity?.incidentHistory,
    'cybersecurity.incidentHistory',
    transcript
  );
  if (incidentHistory) {
    cybersecurity.incidentHistory = incidentHistory.text;
    cybersecurityEvidence.push(incidentHistory.evidence);
  }

  if (Object.keys(cybersecurity).length > 0) {
    facts.cybersecurity = cybersecurity;
    evidence.push(...cybersecurityEvidence);
  }

  const planning: NonNullable<ExtractedFacts['planning']> = {};
  const goals = mapFactList(
    output.planning?.goals,
    (index) => `planning.goals[${index}]`,
    transcript
  );
  if (goals.values.length > 0) {
    planning.goals = goals.values;
    evidence.push(...goals.evidence);
  }

  const constraints = mapFactList(
    output.planning?.constraints,
    (index) => `planning.constraints[${index}]`,
    transcript
  );
  if (constraints.values.length > 0) {
    planning.constraints = constraints.values;
    evidence.push(...constraints.evidence);
  }

  const nextSteps = mapFactList(
    output.planning?.nextSteps,
    (index) => `planning.nextSteps[${index}]`,
    transcript
  );
  if (nextSteps.values.length > 0) {
    planning.nextSteps = nextSteps.values;
    evidence.push(...nextSteps.evidence);
  }

  if (Object.keys(planning).length > 0) {
    facts.planning = planning;
  }

  if (evidence.length > 0) {
    facts.evidence = evidence.slice(0, ASSESSMENT_EVIDENCE_MAX_ITEMS);
  }

  return facts;
}
