import * as React from "react";

import {noop} from "../utils";

import InputWrapperContext from "./InputWrapperContext";

import {Validator, MaybeError} from "./types";

interface FieldProps<IdentifierType, ValueType> {
  identifier: IdentifierType;
  value: ValueType;
  error: string;
  showError: boolean;
  label?: string;
  validation?: Validator<ValueType>;
  onChange: (identifier: IdentifierType, newValue: ValueType) => void;
  onAsyncValidationStarted: (identifier: IdentifierType) => void; // only called for async validations
  onValidation: (identifier: IdentifierType, error: MaybeError) => void; // called when we are finished validating
  onBlur: (identifier: IdentifierType) => void;
  children: (
    params: {value: ValueType; onChange: (newValue: ValueType) => void}
  ) => React.ReactNode;
}

// IdentifierType is string for ObjectField children, number for ArrayField
export default class Field<IdentifierType, ValueType> extends React.Component<
  FieldProps<IdentifierType, ValueType>
> {
  defaultProps = {
    label: "",
    validation: noop,
  };

  constructor(props: FieldProps<IdentifierType, ValueType>) {
    super(props);

    this.validate(props.value);
  }

  componentDidUpdate(prevProps: FieldProps<IdentifierType, ValueType>) {
    if (prevProps.value !== this.props.value) {
      this.validate(this.props.value);
    }
  }

  // TODO(zach): Maybe don't do this?
  validate(value: ValueType) {
    const error = this.props.validation!(value);
    if (typeof error === "string" || typeof error === "undefined") {
      this.props.onValidation(this.props.identifier, error);
    } else {
      error.then((result: MaybeError) => {
        this.props.onValidation(this.props.identifier, result);
      });
      this.props.onAsyncValidationStarted(this.props.identifier);
    }
  }

  handleChange = (newValue: ValueType) => {
    this.props.onChange(this.props.identifier, newValue);
    // don't validate here, validate when we get the new value in props
  };

  render() {
    const error = "STOPSHIP";
    const showError = true;
    return (
      <InputWrapperContext.Consumer>
        {({InputWrapper}) => {
          return (
            <InputWrapper
              label={this.props.label!}
              error={error}
              showError={showError}
            >
              {this.props.children({
                value: this.props.value,
                onChange: this.handleChange,
              })}
            </InputWrapper>
          );
        }}
      </InputWrapperContext.Consumer>
    );
  }
}

// class ArrayField<ElementType> extends React.Component<{}, {}> {
//   render() {
//     return <ArrayField>
//       {(elements: ReadonlyArray<ElementType>, {appendElement, removeElement}) => {
//         class MonoObjectField extends ObjectField<ElementType> {}
//         return elements.map(([element, key, onChange]) => {
//           return <MonoObjectField key={key}>
//             {
//               (Fields) => {
//                 return <div>
//                   <div>
//                     <Fields.foo></Fields.foo>
//                   </div>
//                 </div>;
//               }
//             }
//             </MonoObjectField>;
//         }
//       }}
//     </ArrayField>
//   }
// }
