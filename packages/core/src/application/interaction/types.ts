import { Actor } from '../../domain/actor';
import { Interaction } from '../../domain/interaction';
import {
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  InvalidInteractionStateError,
  UnauthorizedAnalyzeInteractionError,
} from '../../errors';
import { AuditPort } from '../../ports/audit';
import { InteractionRepository } from '../../ports/interaction-repository';
import { SecretScanner } from '../../ports/secret-scanner';
import { StructuredLLM } from '../../ports/structured-llm';

export type AnalyzeInteractionInput = Readonly<{
  actor: Actor;
  interactionId: string;
}>;

export type AnalyzeInteractionDependencies = Readonly<{
  interactionsRepo: InteractionRepository;
  secretScanner: SecretScanner;
  structuredLLM: StructuredLLM;
  audit: AuditPort;
}>;

interface SuccessResponse<T> {
  readonly success: true;
  readonly value: T;
}

interface FailureResponse<E> {
  readonly success: false;
  readonly error: E;
}

export type UseCaseResponse<T, E> = SuccessResponse<T> | FailureResponse<E>;

export class Result<T, E> {
  protected constructor(protected readonly response: UseCaseResponse<T, E>) {}

  public isSuccess(): this is Result<T, E> & { response: SuccessResponse<T> } {
    return this.response.success;
  }

  public isFailure(): this is Result<T, E> & { response: FailureResponse<E> } {
    return !this.response.success;
  }

  public getValue(): T {
    if ('value' in this.response) {
      return this.response.value;
    }

    throw new Error('Cannot get value from failed response');
  }

  public getError(): E {
    if ('error' in this.response) {
      return this.response.error;
    }

    throw new Error('Cannot get error from successful response');
  }

  static success<T, E>(value: T): Result<T, E> {
    return new Result<T, E>({ success: true, value });
  }

  static failure<T, E>(error: E): Result<T, E> {
    return new Result<T, E>({ success: false, error });
  }
}

export type AnalyzeInteractionError =
  | UnauthorizedAnalyzeInteractionError
  | InteractionAnalysisFailedError
  | InteractionNotFoundError
  | InvalidInteractionStateError;

export type AnalyzeInteractionResult = Result<Interaction, AnalyzeInteractionError>;
