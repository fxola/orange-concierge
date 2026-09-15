import { ExtractedFacts } from '../interaction/extracted-facts';

function appendFactText(parts: string[], value: string | readonly string[] | undefined): void {
  if (typeof value === 'string') {
    parts.push(value);
    return;
  }

  if (value) {
    parts.push(...value);
  }
}

export function buildKnowledgeQuery(facts: ExtractedFacts): string {
  const parts: string[] = [];

  appendFactText(parts, facts.custody?.currentArrangement);
  appendFactText(parts, facts.custody?.assetsDiscussed);
  appendFactText(parts, facts.custody?.concerns);
  appendFactText(parts, facts.cybersecurity?.controls);
  appendFactText(parts, facts.cybersecurity?.risks);
  appendFactText(parts, facts.cybersecurity?.incidentHistory);
  appendFactText(parts, facts.planning?.goals);
  appendFactText(parts, facts.planning?.constraints);

  return parts.join(' ');
}
