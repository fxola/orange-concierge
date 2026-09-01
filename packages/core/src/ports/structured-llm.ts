export type StructuredLLMInput = Readonly<{
  interactionId: string;
  transcript: string;
}>;

export interface StructuredLLM {
  extractClientAssessment(input: StructuredLLMInput): Promise<unknown>;
}
