import type { EvidenceReference, ExtractedFacts } from '@orange-concierge/core';
import type { FactGroupKey, FactItem } from './types';

export const FACT_GROUPS: readonly FactGroupKey[] = ['custody', 'cybersecurity', 'planning'];

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

export function itemsForGroup(
  items: readonly FactItem[],
  group: FactGroupKey
): readonly FactItem[] {
  return items.filter((item) => item.group === group);
}
