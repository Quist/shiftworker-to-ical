export type Result<T, E = Failure> = Success<T> | Failure<E>;
type Success<T> = { ok: true; value: T };
type Failure<E = Error> = { ok: false; error: E };

export const success = <T>(value: T): Success<T> => {
  return { ok: true, value: value };
};

export const failure = <T>(error: T): Failure<T> => {
  return { ok: false, error: error };
};
export const orElseThrow = <T>(result: Result<T, any>): Success<T> => {
  if (result.ok) {
    return result;
  }
  throw Error(
    `Expected result to be true, but instead it was failure: ${result.error}`
  );
};
