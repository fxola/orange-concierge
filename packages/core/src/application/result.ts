export type SuccessResponse<T> = Readonly<{
  success: true;
  value: T;
}>;

export type FailureResponse<E> = Readonly<{
  success: false;
  error: E;
}>;

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
