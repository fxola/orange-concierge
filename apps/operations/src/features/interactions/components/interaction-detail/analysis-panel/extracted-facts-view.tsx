'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  calculateEvidenceCoverage,
  type ExtractedFacts,
  type ReadinessScore,
} from '@orange-concierge/core';

import { verifyInteractionFacts } from '../../../presenters/verify-interaction-facts';
import {
  collectFactItems,
  hasExtractedFacts,
  partitionFactItems,
} from '../../../view-models/analysis-facts';
import {
  ConfirmedByConsultantSection,
  EmptyFacts,
  FactsWithProofSection,
  NeedsReviewSection,
  ReadinessBanner,
} from './fact-sections';

export function ExtractedFactsView({
  interactionId,
  facts,
  verifiedFactPaths,
  readinessScore,
  canVerifyFacts,
}: Readonly<{
  interactionId: string;
  facts: ExtractedFacts;
  verifiedFactPaths: readonly string[];
  readinessScore?: ReadinessScore;
  canVerifyFacts: boolean;
}>) {
  const router = useRouter();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  if (!hasExtractedFacts(facts)) {
    return <EmptyFacts />;
  }

  const items = collectFactItems(facts);
  const verifiedSet = new Set(verifiedFactPaths);
  const coverage = calculateEvidenceCoverage(facts, verifiedFactPaths);
  const { withTranscriptProof, confirmedByConsultant, needsReview } = partitionFactItems(
    items,
    verifiedFactPaths
  );

  const onToggle = async (factPath: string) => {
    const next = verifiedSet.has(factPath)
      ? [...verifiedSet].filter((path) => path !== factPath)
      : [...verifiedSet, factPath];
    setPendingPath(factPath);

    try {
      const viewModel = await verifyInteractionFacts(interactionId, next);

      if (viewModel.status === 'ok') {
        toast.success(
          verifiedSet.has(factPath) ? 'Verification removed.' : 'Fact confirmed against transcript.'
        );
        router.refresh();
        return;
      }

      if (viewModel.unauthorized) {
        router.push('/login');
        router.refresh();
        return;
      }

      toast.error(viewModel.message);
    } finally {
      setPendingPath(null);
    }
  };

  return (
    <div className="grid gap-4">
      <ReadinessBanner readinessScore={readinessScore} coverage={coverage} />
      <FactsWithProofSection items={withTranscriptProof} totalCount={items.length} />
      <ConfirmedByConsultantSection
        items={confirmedByConsultant}
        canVerifyFacts={canVerifyFacts}
        pendingPath={pendingPath}
        onToggle={onToggle}
      />
      <NeedsReviewSection
        items={needsReview}
        canVerifyFacts={canVerifyFacts}
        pendingPath={pendingPath}
        onToggle={onToggle}
      />
    </div>
  );
}
