import * as React from "react";

import {assertNever} from "./utils";

// Don't use an enum for Flow compat
export type FeedbackStrategy =
  | "OnFirstBlur"
  | "OnFirstChange"
  | "OnFirstSuccess"
  | "OnFirstSuccessOrFirstBlur"
  | "OnSubmit";

interface Errors<DraftType extends object> {
  fieldErrors: {[P in keyof DraftType]: string | null};
  formErrors: Array<FormError<DraftType>>;
}

// The context payload needs to be cast with a DraftType, since all forms share a context with the same type
type ContextPayload<DraftType extends object> = {
  formState: DraftType;
  errors: Errors<DraftType>;
  onChange: <P extends keyof DraftType>(name: P, value: DraftType[P]) => void;
  onBlur: <P extends keyof DraftType>(fieldName: P) => void;
};
type MonoContextPayload = ContextPayload<{}>;

const FormContext = React.createContext(
  null
) as React.Context<null | MonoContextPayload>;

export interface MetaField {
  touched: boolean; // blurred
  changed: boolean;
  succeeded: boolean;
  asyncValidationInFlight: boolean;
}

export interface Meta<DraftType extends object> {
  pristine: boolean;
  submitted: boolean;

  fields: {[P in keyof DraftType]: MetaField};
}

export interface FormError<DraftType> {
  message: string;
  fields?: Array<keyof DraftType>;
}

export type FieldValidator<FieldType> = (x: FieldType) => null | string;
export type FormValidator<DraftType> = (
  x: DraftType
) => Array<FormError<DraftType>>;

export type SubmitFunction<DraftType> = (x: DraftType) => void;

export interface FormProps<DraftType extends object> {
  initialValue: DraftType;
  children: (
    formParams: {
      onSubmit: (e: React.FormEvent<HTMLElement>) => void;
      formState: Readonly<DraftType>;
      meta: Meta<DraftType>;
    },
    fields: FieldsObject<DraftType>
  ) => React.ReactNode;
  fieldValidations?: Partial<
    {[P in keyof DraftType]: FieldValidator<DraftType[P]>}
  >;
  validations?: ReadonlyArray<FormValidator<DraftType>>;
  feedbackStrategy?: FeedbackStrategy;
  onSubmit: SubmitFunction<DraftType>;
  onValidationFailure?: (errors: ReadonlyArray<FormError<DraftType>>) => void;
  onFieldChange?: <P extends keyof DraftType>(
    fieldName: P,
    newValue: DraftType[P],
    updateField: <P2 extends keyof DraftType>(
      fieldName: P2,
      newValue: DraftType[P2]
    ) => void
  ) => void;
}

export interface FormState<DraftType extends object> {
  formState: DraftType;
  meta: Meta<DraftType>;
}

function makeNewMeta<DraftType extends object>(
  draft: DraftType
): Meta<DraftType> {
  return {
    pristine: true,
    submitted: false,
    fields: Object.keys(draft).reduce((memo, key) => {
      // this seems unsound
      const metaField: MetaField = {
        touched: false,
        changed: false,
        succeeded: false,
        asyncValidationInFlight: false,
      };
      return Object.assign(memo, {[key]: metaField});
    }, {}) as {[P in keyof DraftType]: MetaField},
  };
}

export default class Form<DraftType extends object> extends React.Component<
  FormProps<DraftType>,
  FormState<DraftType>
> {
  static defaultProps = {
    fieldValidations: {},
    validations: [],
    feedbackStrategy: "OnFirstBlur",
  };

  private fieldCache: null | FieldsObject<DraftType> = null;

  constructor(props: FormProps<DraftType>) {
    super(props);
    this.state = {
      formState: props.initialValue,
      meta: makeNewMeta(props.initialValue),
    };
  }

  reset() {
    this.setState({
      formState: this.props.initialValue,
      meta: makeNewMeta(this.props.initialValue),
    });
  }

  render() {
    return (
      <FormContext.Provider
        value={{
          formState: this.state.formState,
          // Filthy monomorphization lies
          // tslint:disable-next-line no-any
          errors: (this.makeErrors() as any) as Errors<{}>,
          onChange: this.handleFieldChange,
          onBlur: this.handleFieldBlur,
        }}
      >
        {this.props.children(
          {
            meta: this.state.meta,
            formState: this.state.formState,
            onSubmit: this.handleSubmit,
          },
          this.fields
        )}
      </FormContext.Provider>
    );
  }

  private get fields(): FieldsObject<DraftType> {
    if (this.fieldCache == null) {
      const fields = makeFields(this.state.formState);
      this.fieldCache = fields;
    }
    return this.fieldCache;
  }

  private shouldShowFeedbackForFields<P extends keyof DraftType>(
    fieldNames: ReadonlyArray<P>
  ): boolean {
    const feedbackStrategy = this.props.feedbackStrategy as FeedbackStrategy;
    switch (feedbackStrategy) {
      case "OnFirstBlur":
        for (const fieldName of fieldNames) {
          if (this.state.meta.fields[fieldName].touched === false) {
            return false;
          }
        }
        return true;
      case "OnFirstChange":
        for (const fieldName of fieldNames) {
          if (this.state.meta.fields[fieldName].changed === false) {
            return false;
          }
        }
        return true;
      case "OnFirstSuccess":
        for (const fieldName of fieldNames) {
          if (this.state.meta.fields[fieldName].succeeded === false) {
            return false;
          }
        }
        return true;
      case "OnFirstSuccessOrFirstBlur":
        for (const fieldName of fieldNames) {
          if (
            !this.state.meta.fields[fieldName].succeeded &&
            !this.state.meta.fields[fieldName].touched
          ) {
            return false;
          }
        }
        return true;
      case "OnSubmit":
        return this.state.meta.submitted;
      default:
        assertNever(feedbackStrategy);
        return false;
    }
  }

  // use the strategy and meta to figure out what errors to show
  private makeErrors(): Errors<DraftType> {
    let fieldErrors = Object.keys(this.props.initialValue).reduce(
      (memo, k) => {
        return Object.assign(memo, {[k]: null});
      },
      {} as {[P in keyof DraftType]: null | string}
    );
    if (this.props.fieldValidations) {
      const fieldValidations = this.props.fieldValidations;
      Object.keys(this.props.fieldValidations).forEach(k => {
        const typedKey = k as keyof DraftType;
        if (this.shouldShowFeedbackForFields([typedKey])) {
          const validator = fieldValidations[typedKey];
          if (validator) {
            fieldErrors[typedKey] = validator(this.state.formState[typedKey]);
          }
        }
      });
    }

    let formErrors: Array<FormError<DraftType>> = [];
    if (this.props.validations) {
      this.props.validations.forEach(validation => {
        const errors = validation(this.state.formState);
        const errorsToShow = errors.filter(e => {
          if (e.fields === undefined) {
            return true;
          }
          return this.shouldShowFeedbackForFields(e.fields);
        });
        formErrors = formErrors.concat(errorsToShow);
      });
    }

    return {
      fieldErrors,
      formErrors,
    };
  }

  private handleSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    this.setState(prevState => {
      return {
        meta: Object.assign({}, prevState.meta, {submitted: true}),
      };
    });

    const errors = this.makeErrors();

    const fieldErrorsArray = Object.keys(errors.fieldErrors).reduce(
      (memo, error) => {
        return error === null ? memo : memo.concat([error]);
      },
      [] as Array<string>
    );

    if (fieldErrorsArray.length === 0 && errors.formErrors.length === 0) {
      this.props.onSubmit(this.state.formState);
    }
  };

  private updateFieldMeta<P extends keyof DraftType>(
    fieldName: P,
    metaKey: "touched" | "changed" | "succeeded",
    metaValue: boolean
  ) {
    this.setState(prevState => {
      // return {
      //   meta: {
      //     ...prevState.meta,
      //     fields: {
      //       ...prevState.meta.fields,
      //       [fieldName]: {
      //         ...prevState.meta.fields[fieldName],
      //         touched: true,
      //       },
      //     },
      //   },
      // };
      const prevFieldMeta = prevState.meta.fields[fieldName];
      const newFields = Object.assign({}, prevState.meta.fields, {
        [fieldName]: Object.assign({}, prevFieldMeta, {[metaKey]: metaValue}),
      });
      return {
        meta: Object.assign({}, prevState.meta, {fields: newFields}),
      };
    });
  }

  private updateField = <P extends keyof DraftType>(
    fieldName: P,
    newValue: DraftType[P]
  ) => {
    // this.setState({...this.state.formState, [fieldName]: newValue});
    // rework this so there aren't sequenced setState()s, yuck!
    this.setState(
      prevState => {
        const prevFormState = prevState.formState;
        return {
          formState: Object.assign({}, prevFormState, {[fieldName]: newValue}),
        };
      },
      () => {
        // set succeeded
        let formErrors: Array<FormError<DraftType>> = [];
        if (this.props.validations) {
          this.props.validations.forEach(validation => {
            formErrors = formErrors.concat(validation(this.state.formState));
          });
        }
        const relevantFormErrors = formErrors.filter(
          error => error.fields && error.fields.indexOf(fieldName) !== -1
        );

        let fieldError = null;
        if (this.props.fieldValidations) {
          const validator = this.props.fieldValidations[fieldName];
          if (validator) {
            fieldError = validator(this.state.formState[fieldName]);
          }
        }

        if (relevantFormErrors.length === 0 && fieldError === null) {
          this.updateFieldMeta(fieldName, "succeeded", true);
        }
      }
    );
    // set changed
    this.updateFieldMeta(fieldName, "changed", true);
  };

  private handleFieldChange = <P extends keyof DraftType>(
    fieldName: P,
    newValue: DraftType[P]
  ) => {
    if (this.props.onFieldChange) {
      this.props.onFieldChange(fieldName, newValue, this.updateField);
    } else {
      this.updateField(fieldName, newValue);
    }
  };

  private handleFieldBlur = <P extends keyof DraftType>(fieldName: P) => {
    this.updateFieldMeta(fieldName, "touched", true);
  };
}

export interface FieldProps<DraftType, OutputType> {
  label?: string;
  children: (
    fieldParams: {
      value: OutputType;
      showError: boolean;
      formState: Readonly<DraftType>;
      onChange: (newValue: OutputType) => void;
      onBlur: () => void;
    }
  ) => React.ReactNode;
}

export class Field<
  DraftType extends object,
  OutputType
> extends React.Component<FieldProps<DraftType, OutputType>> {
  // See: https://github.com/Microsoft/TypeScript/issues/3841#issuecomment-337560146
  ["constructor"]: typeof Field;

  static get fieldName(): string {
    throw new Error("tried to get the name of the base Field");
  }

  render() {
    const fieldName = this.constructor.fieldName as keyof DraftType;
    return (
      <FormContext.Consumer>
        {context => {
          if (context == null) {
            throw new Error(
              "Trying to use a <Field> outside of a <Form>. This is not currently supported."
            );
          }
          // other side of the filthy monomorphization lies
          const {
            formState,
            onChange,
            onBlur,
            errors,
            // tslint:disable-next-line no-any
          } = (context as any) as ContextPayload<DraftType>;
          // This cast is a little gross, but static properties can't reference type params
          // also the typechecker probably can't prove OutputType === DraftType[fieldName]
          // tslint:disable-next-line no-any
          const value = (formState[fieldName] as any) as OutputType;
          const fieldError = errors.fieldErrors[fieldName];
          const relevantFormErrors = errors.formErrors.filter(error => {
            if (error.fields === undefined) {
              return false;
            }
            return error.fields.indexOf(fieldName as keyof DraftType) !== -1;
          });
          const input = this.props.children({
            value,
            formState,
            showError: fieldError !== null || relevantFormErrors.length > 0,
            onChange: (newValue: null | OutputType) => {
              // I think the only way for this to work without casting is if this component
              // is parameterized on the type of name :-/
              onChange(
                this.constructor.fieldName as keyof DraftType,
                // tslint:disable-next-line no-any
                newValue as any
              );
            },
            onBlur: () => {
              onBlur(this.constructor.fieldName as keyof DraftType);
            },
          });

          if (this.props.label) {
            return (
              <label>
                {this.props.label}
                {input}
                {fieldError != null ? (
                  <span className="errorText">{fieldError}</span>
                ) : null}
              </label>
            );
          }
          return input;
        }}
      </FormContext.Consumer>
    );
  }
}

export type FieldsObject<DraftType extends object> = {
  [P in keyof DraftType]: {new (): Field<DraftType, DraftType[P]>}
};

function makeFields<DraftType extends object>(
  draft: DraftType
): FieldsObject<DraftType> {
  return Object.keys(draft).reduce((memo, key) => {
    // maybe it's okay to use Field in all the positions here as long as the cast is right
    class F extends Field<DraftType, typeof key> {
      static get fieldName(): string {
        return key;
      }
    }
    return Object.assign(memo, {[key]: F});
  }, {}) as FieldsObject<DraftType>;
}

export class FormErrors extends React.Component<{}> {
  render() {
    return (
      <FormContext.Consumer>
        {context => {
          if (context == null) {
            throw new Error(
              "Trying to use a <FormErrors> outside of a <Form>. This is not currently supported."
            );
          }
          // other side of the filthy monomorphization lies
          const {
            errors,
            // tslint:disable-next-line no-any
          } = context;

          return (
            <div>
              <ul>
                {errors.formErrors.map(e => {
                  return <li key={e.message}>{e.message}</li>;
                })}
              </ul>
            </div>
          );
        }}
      </FormContext.Consumer>
    );
  }
}
