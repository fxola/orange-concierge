import type { EvidenceReference } from '@orange-concierge/core';

export type FactGroupKey = 'custody' | 'cybersecurity' | 'planning';

export type FactItem = Readonly<{
  group: FactGroupKey;
  label: string;
  value: string;
  path: string;
  evidence?: EvidenceReference;
}>;

export type EvidenceHandlers = Readonly<{
  onEvidenceOpen: (entry: EvidenceReference) => void;
}>;
