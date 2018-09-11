// Don't use an enum for Flow compat
export type FeedbackStrategy =
  | "OnFirstBlur"
  | "OnFirstChange"
  | "OnFirstSuccess"
  | "OnFirstSuccessOrFirstBlur"
  | "OnSubmit";

export type Validator<T> = (value: T) => MaybeError | Promise<MaybeError>;

export type MaybeError = string | undefined;
