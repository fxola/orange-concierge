import { INCIDENT_KEYWORDS } from './constants';
import type { ExtractedFacts } from './schemas';

function containsIncidentKeyword(
  value: string
): boolean {
  const lower = value.toLowerCase();

  return INCIDENT_KEYWORDS.some((keyword) =>
    lower.includes(keyword)
  );
}

function extractSmsDisabledControl(
  transcript: string
): string | null {
  const match =
    /SMS recovery is disabled[^.]*\.?/i.exec(transcript);

  if (!match) {
    return null;
  }

  const phrase = match[0].trim();

  return phrase.length > 0 && phrase.length <= 500
    ? phrase
    : null;
}

export function normalizeSecurityPolarity(
  facts: ExtractedFacts,
  transcript: string
): ExtractedFacts {
  const smsDisabled = transcript
    .toLowerCase()
    .includes('sms recovery is disabled');

  const cybersecurity = facts.cybersecurity;

  if (!cybersecurity) {
    return facts;
  }

  let controls = cybersecurity.controls
    ? [...cybersecurity.controls]
    : undefined;

  let risks = cybersecurity.risks
    ? [...cybersecurity.risks]
    : undefined;

  let incidentHistory = cybersecurity.incidentHistory;

  if (smsDisabled) {
    if (risks) {
      const filtered = risks.filter(
        (risk) =>
          !risk.toLowerCase().includes('sms recovery')
      );

      risks =
        filtered.length > 0
          ? filtered
          : undefined;
    }

    const smsControl =
      extractSmsDisabledControl(transcript);

    if (smsControl) {
      const alreadyHasSmsControl =
        controls?.some((control) =>
          control
            .toLowerCase()
            .includes('sms recovery')
        ) ?? false;

      if (!alreadyHasSmsControl) {
        controls = [
          ...(controls ?? []),
          smsControl,
        ];
      }
    }

    if (
      incidentHistory &&
      incidentHistory
        .toLowerCase()
        .includes('disabled where providers')
    ) {
      incidentHistory = undefined;
    }
  }

  if (
    incidentHistory &&
    !containsIncidentKeyword(incidentHistory)
  ) {
    incidentHistory = undefined;
  }

  const nextCybersecurity = {
    ...(controls ? { controls } : {}),
    ...(risks ? { risks } : {}),
    ...(incidentHistory
      ? { incidentHistory }
      : {}),
  };

  if (
    Object.keys(nextCybersecurity).length === 0
  ) {
    const {
      cybersecurity: _dropped,
      ...rest
    } = facts;

    return rest;
  }

  return {
    ...facts,
    cybersecurity: nextCybersecurity,
  };
}
