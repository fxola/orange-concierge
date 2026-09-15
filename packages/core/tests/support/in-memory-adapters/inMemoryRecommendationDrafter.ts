import {
  DraftRecommendation,
  RecommendationDrafter,
  RecommendationDraftingInput,
  RecommendationDraftingResult,
  Result,
} from '../../../src';

export class InMemoryRecommendationDrafter implements RecommendationDrafter {
  readonly inputs: RecommendationDraftingInput[] = [];

  constructor(
    private readonly operations: string[],
    private readonly drafts: readonly DraftRecommendation[]
  ) {}

  async draftRecommendations(
    input: RecommendationDraftingInput
  ): Promise<RecommendationDraftingResult> {
    this.operations.push('draft');
    this.inputs.push(input);
    return Result.success(this.drafts);
  }
}
