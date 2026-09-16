import {
  DraftRecommendation,
  RecommendationDrafter,
  RecommendationDraftingFailureReason,
  RecommendationDraftingInput,
  RecommendationDraftingResult,
  Result,
} from '../../../src';

export class InMemoryRecommendationDrafter implements RecommendationDrafter {
  readonly inputs: RecommendationDraftingInput[] = [];

  constructor(
    private readonly operations: string[],
    private readonly drafts: readonly DraftRecommendation[],
    private readonly failureReason?: RecommendationDraftingFailureReason
  ) {}

  async draftRecommendations(
    input: RecommendationDraftingInput
  ): Promise<RecommendationDraftingResult> {
    this.operations.push('draft');
    this.inputs.push(input);

    if (this.failureReason) {
      return Result.failure(this.failureReason);
    }

    return Result.success(this.drafts);
  }
}
