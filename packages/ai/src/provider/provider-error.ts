import type { ExtractAssessmentFailureReason } from '@orange-concierge/core';

export type ProviderErrorKind = ExtractAssessmentFailureReason;

export class ProviderError extends Error {
  readonly kind: ProviderErrorKind;

  constructor(kind: ProviderErrorKind, message?: string, options?: { cause?: unknown }) {
    super(message ?? kind, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'ProviderError';
    this.kind = kind;
  }
}
