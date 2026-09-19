import type { FactItem } from '../../../../view-models/analysis-facts';

export type ConfirmableSectionProps = Readonly<{
  items: readonly FactItem[];
  canVerifyFacts: boolean;
  pendingPath: string | null;
  onToggle: (factPath: string) => void;
}>;
