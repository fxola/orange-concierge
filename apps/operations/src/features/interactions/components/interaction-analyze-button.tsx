'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { analyzeInteraction } from '../presenters/analyze-interaction';

export function InteractionAnalyzeButton({ interactionId }: Readonly<{ interactionId: string }>) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const onAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      const viewModel = await analyzeInteraction(interactionId);

      if (viewModel.status === 'ok') {
        toast.success('Analysis complete.');
        router.refresh();
        return;
      }

      if (viewModel.unauthorized) {
        router.push('/login');
        router.refresh();
        return;
      }

      toast.error(viewModel.message);
      router.refresh();
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-2">
      {isAnalyzing ? (
        <span role="status" className="text-xs leading-5 text-muted-foreground">
          Analyzing transcript locally. This may take up to 30 seconds.
        </span>
      ) : null}
      <Button variant="outline" size="sm" onClick={onAnalyze} disabled={isAnalyzing}>
        {isAnalyzing ? 'Analyzing...' : 'Analyze interaction'}
      </Button>
    </span>
  );
}
