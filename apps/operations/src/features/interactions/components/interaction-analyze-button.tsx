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
    <Button variant="outline" size="sm" onClick={onAnalyze} disabled={isAnalyzing}>
      {isAnalyzing ? 'Analyzing...' : 'Analyze interaction'}
    </Button>
  );
}
