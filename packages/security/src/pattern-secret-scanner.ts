import type { SecretFinding, SecretScannerAPI, SecretScanResult } from '@orange-concierge/core';

const WORD = '[a-z]{3,12}';
const SEED_PHRASE_ASSIGNMENT_PATTERN = new RegExp(
  `\\b(?:seed|recovery|mnemonic)\\s+(?:phrase|words?)\\s*(?::|=|is|are)\\s*(${WORD}(?:\\s+${WORD}){11})\\b`,
  'gi'
);
const EXTENDED_PRIVATE_KEY_PATTERN = /\b(?:xprv|xpriv|tprv|yprv|zprv)[1-9A-HJ-NP-Za-km-z]{20,}\b/g;
const HEX_PRIVATE_KEY_PATTERN = /\b0x[a-fA-F0-9]{64}\b/g;
const API_KEY_ASSIGNMENT_PATTERN = /\bapi\s+key\b\s*[:=]\s*([A-Za-z0-9_-]{16,})\b/gi;
const RECOVERY_CODE_ASSIGNMENT_PATTERN =
  /\b(?:recovery|backup)\s+codes?\b\s*[:=]\s*([A-Za-z0-9]{4}(?:-[A-Za-z0-9]{4}){1,5})\b/gi;
const MAX_FINDINGS = 20;

type PendingFinding = SecretFinding & Readonly<{ order: number }>;

function normalizeFindings(findings: readonly PendingFinding[]): readonly SecretFinding[] {
  const sorted = [...findings].sort((left, right) => left.start - right.start || left.order - right.order);
  const normalized: SecretFinding[] = [];

  for (const { order, ...finding } of sorted) {
    if (normalized.length === MAX_FINDINGS) break;
    if (normalized.some((kept) => finding.start < kept.end && kept.start < finding.end)) continue;

    normalized.push(finding);
  }

  return normalized;
}

export class PatternSecretScanner implements SecretScannerAPI {
  scan(input: { text: string }): SecretScanResult {
    const findings: PendingFinding[] = [];
    let order = 0;

    for (const match of input.text.matchAll(SEED_PHRASE_ASSIGNMENT_PATTERN)) {
      if (match.index === undefined || match[1] === undefined) continue;

      const start = match.index + match[0].indexOf(match[1]);

      findings.push({
        type: 'seed_phrase',
        severity: 'prohibited',
        start,
        end: start + match[1].length,
        label: 'Possible seed phrase',
        order: order++,
      });
    }

    for (const match of input.text.matchAll(EXTENDED_PRIVATE_KEY_PATTERN)) {
      if (match.index === undefined) continue;

      findings.push({
        type: 'private_key',
        severity: 'prohibited',
        start: match.index,
        end: match.index + match[0].length,
        label: 'Possible private key',
        order: order++,
      });
    }

    for (const match of input.text.matchAll(HEX_PRIVATE_KEY_PATTERN)) {
      if (match.index === undefined) continue;

      findings.push({
        type: 'private_key',
        severity: 'prohibited',
        start: match.index,
        end: match.index + match[0].length,
        label: 'Possible private key',
        order: order++,
      });
    }

    for (const match of input.text.matchAll(API_KEY_ASSIGNMENT_PATTERN)) {
      if (match.index === undefined || match[1] === undefined) continue;

      const start = match.index + match[0].indexOf(match[1]);
      findings.push({
        type: 'api_key',
        severity: 'prohibited',
        start,
        end: start + match[1].length,
        label: 'Possible API key',
        order: order++,
      });
    }

    for (const match of input.text.matchAll(RECOVERY_CODE_ASSIGNMENT_PATTERN)) {
      if (match.index === undefined || match[1] === undefined) continue;

      const start = match.index + match[0].indexOf(match[1]);
      findings.push({
        type: 'recovery_code',
        severity: 'prohibited',
        start,
        end: start + match[1].length,
        label: 'Possible recovery code',
        order: order++,
      });
    }

    return { findings: normalizeFindings(findings) };
  }
}
