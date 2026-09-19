'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface VerifyToggleProps {
  factPath: string;
  verified: boolean;
  disabled: boolean;
  pending: boolean;
  onToggle: (factPath: string) => void;
}

export function VerifyToggle({
  factPath,
  verified,
  disabled,
  pending,
  onToggle,
}: VerifyToggleProps) {
  return (
    <Button
      type="button"
      variant={verified ? 'secondary' : 'outline'}
      size="sm"
      disabled={disabled}
      aria-pressed={verified}
      aria-label={
        verified
          ? `Undo verification for ${factPath}`
          : `Confirm ${factPath} against the transcript`
      }
      onClick={() => onToggle(factPath)}
      className="shrink-0"
    >
      {pending ? (
        'Saving...'
      ) : (
        <>
          <Check aria-hidden="true" className="h-3.5 w-3.5" />
          {verified ? 'Confirmed' : 'Confirm'}
        </>
      )}
    </Button>
  );
}
