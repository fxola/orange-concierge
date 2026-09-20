import type { EvidenceReference, ExtractedFacts } from '@orange-concierge/core';

export type FactGroupKey = 'custody' | 'cybersecurity' | 'planning';

export type FactItem = Readonly<{
  group: FactGroupKey;
  label: string;
  value: string;
  path: string;
  evidence?: EvidenceReference;
}>;

function evidenceFor(
  evidence: readonly EvidenceReference[] | undefined,
  factPath: string
): EvidenceReference | undefined {
  return evidence?.find((entry) => entry.factPath === factPath);
}

export function hasExtractedFacts(facts: ExtractedFacts): boolean {
  return Boolean(facts.custody || facts.cybersecurity || facts.planning);
}

function addTextFact(
  items: FactItem[],
  facts: ExtractedFacts,
  group: FactGroupKey,
  label: string,
  path: string,
  value: string | undefined
): void {
  if (!value) {
    return;
  }

  items.push({ group, label, value, path, evidence: evidenceFor(facts.evidence, path) });
}

function addListFacts(
  items: FactItem[],
  facts: ExtractedFacts,
  group: FactGroupKey,
  label: string,
  basePath: string,
  values: readonly string[] | undefined
): void {
  if (!values) {
    return;
  }

  values.forEach((value, index) => {
    addTextFact(items, facts, group, label, `${basePath}[${index}]`, value);
  });
}

export function collectFactItems(facts: ExtractedFacts): readonly FactItem[] {
  const items: FactItem[] = [];

  addTextFact(
    items,
    facts,
    'custody',
    'Current arrangement',
    'custody.currentArrangement',
    facts.custody?.currentArrangement
  );
  addListFacts(
    items,
    facts,
    'custody',
    'Assets discussed',
    'custody.assetsDiscussed',
    facts.custody?.assetsDiscussed
  );
  addListFacts(items, facts, 'custody', 'Concerns', 'custody.concerns', facts.custody?.concerns);

  addListFacts(
    items,
    facts,
    'cybersecurity',
    'Controls',
    'cybersecurity.controls',
    facts.cybersecurity?.controls
  );
  addListFacts(
    items,
    facts,
    'cybersecurity',
    'Risks',
    'cybersecurity.risks',
    facts.cybersecurity?.risks
  );
  addTextFact(
    items,
    facts,
    'cybersecurity',
    'Incident history',
    'cybersecurity.incidentHistory',
    facts.cybersecurity?.incidentHistory
  );

  addListFacts(items, facts, 'planning', 'Goals', 'planning.goals', facts.planning?.goals);
  addListFacts(
    items,
    facts,
    'planning',
    'Constraints',
    'planning.constraints',
    facts.planning?.constraints
  );
  addListFacts(
    items,
    facts,
    'planning',
    'Next steps',
    'planning.nextSteps',
    facts.planning?.nextSteps
  );

  return items;
}

export type PartitionedFactItems = Readonly<{
  withTranscriptProof: readonly FactItem[];
  confirmedByConsultant: readonly FactItem[];
  needsReview: readonly FactItem[];
}>;

export function partitionFactItems(
  items: readonly FactItem[],
  verifiedFactPaths: readonly string[]
): PartitionedFactItems {
  const verifiedSet = new Set(verifiedFactPaths);

  return {
    withTranscriptProof: items.filter((item) => item.evidence),
    confirmedByConsultant: items.filter(
      (item) => !item.evidence && verifiedSet.has(item.path)
    ),
    needsReview: items.filter((item) => !item.evidence && !verifiedSet.has(item.path)),
  };
}
