export function normalizeTranscriptText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[“”"‘’']/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[.,;:!?]+$/g, '')
    .trim();
}

export function isExactTranscriptMatch(value: string, quote: string): boolean {
  const normalizedValue = normalizeTranscriptText(value);
  const normalizedQuote = normalizeTranscriptText(quote);
  return normalizedValue.length > 0 && normalizedValue === normalizedQuote;
}
