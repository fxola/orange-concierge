import type { ExtractedFacts } from './client-assessment-facts';

export type ReadinessLevel = 'needs_attention' | 'developing' | 'ready';

export type ReadinessScoreBand = Readonly<{
  score: number;
  level: ReadinessLevel;
  rationale: readonly string[];
}>;

export type ReadinessScore = Readonly<{
  overall: ReadinessScoreBand;
  custody: ReadinessScoreBand;
  cybersecurity: ReadinessScoreBand;
}>;

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function levelFor(score: number): ReadinessLevel {
  if (score >= 75) {
    return 'ready';
  }

  if (score >= 50) {
    return 'developing';
  }

  return 'needs_attention';
}

function band(score: number, rationale: readonly string[]): ReadinessScoreBand {
  const clamped = clampScore(score);
  return {
    score: clamped,
    level: levelFor(clamped),
    rationale,
  };
}

function hasAny(values: readonly string[] | undefined): boolean {
  return Boolean(values && values.length > 0);
}

function scoreCustody(facts: ExtractedFacts): ReadinessScoreBand {
  let score = 40;
  const rationale: string[] = [];
  const custody = facts.custody;

  if (custody?.currentArrangement) {
    score += 25;
    rationale.push('Custody arrangement is documented.');
  } else {
    rationale.push('Custody arrangement is not documented.');
  }

  if (hasAny(custody?.assetsDiscussed)) {
    score += 15;
    rationale.push('Assets under discussion are identified.');
  } else {
    rationale.push('Assets under discussion are not identified.');
  }

  if (hasAny(custody?.concerns)) {
    score -= 15;
    rationale.push('Unresolved custody concerns were raised.');
  }

  return band(score, rationale);
}

function scoreCybersecurity(facts: ExtractedFacts): ReadinessScoreBand {
  let score = 40;
  const rationale: string[] = [];
  const cybersecurity = facts.cybersecurity;

  if (hasAny(cybersecurity?.controls)) {
    score += 40;
    rationale.push('Security controls are documented.');
  } else {
    rationale.push('Security controls are not documented.');
  }

  if (hasAny(cybersecurity?.risks)) {
    score -= 15;
    rationale.push('Security risks were identified.');
  }

  if (cybersecurity?.incidentHistory) {
    score -= 15;
    rationale.push('Incident history needs review.');
  }

  return band(score, rationale);
}

export function calculateReadinessScore(facts: ExtractedFacts): ReadinessScore {
  const custody = scoreCustody(facts);
  const cybersecurity = scoreCybersecurity(facts);
  const overallScore = Math.round((custody.score + cybersecurity.score) / 2);

  return {
    overall: band(overallScore, [
      `Custody readiness is ${custody.level} at ${custody.score}.`,
      `Cybersecurity readiness is ${cybersecurity.level} at ${cybersecurity.score}.`,
    ]),
    custody,
    cybersecurity,
  };
}
