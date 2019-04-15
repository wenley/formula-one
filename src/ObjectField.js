// @flow strict

import * as React from "react";

import type {
  FieldLink,
  Validation,
  Extras,
  ClientErrors,
  AdditionalRenderInfo,
  CustomChange,
} from "./types";
import {FormContext} from "./Form";
import {
  type FormState,
  setChanged,
  replaceObjectChild,
  setExtrasTouched,
  objectChild,
  validate,
  getExtras,
  flatRootErrors,
  isValid,
  changedFormState,
} from "./formState";
import {
  type ShapedTree,
  type ShapedPath,
  mapRoot,
  dangerouslyReplaceObjectChild,
} from "./shapedTree";

type ToFieldLink = <T>(T) => FieldLink<T>;
type Links<T: {}> = $ObjMap<T, ToFieldLink>;

type Props<T: {}> = {|
  +link: FieldLink<T>,
  +validation: Validation<T>,
  +customChange?: CustomChange<T>,
  +children: (
    links: Links<T>,
    additionalInfo: AdditionalRenderInfo<T>
  ) => React.Node,
|};

function makeLinks<T: {}, V>(
  formState: FormState<T>,
  onChildChange: (string, FormState<V>) => void,
  onChildBlur: (string, ShapedTree<V, Extras>) => void,
  onChildValidation: (string, ShapedPath<V>, ClientErrors) => void
): Links<T> {
  const [value] = formState;
  return Object.keys(value).reduce((memo, k) => {
    const l = {
      formState: objectChild(k, formState),
      onChange: childFormState => {
        onChildChange(k, childFormState);
      },
      onBlur: childTree => {
        onChildBlur(k, childTree);
      },
      onValidation: (path, errors) => {
        onChildValidation(k, path, errors);
      },
    };
    memo[k] = l;
    return {
      ...memo,
      [k]: l,
    };
  }, {});
}

type State = {|
  nonce: number,
|};

export default class ObjectField<T: {}> extends React.Component<
  Props<T>,
  State
> {
  static contextType = FormContext;
  static _contextType = FormContext;
  static defaultProps = {
    validation: () => [],
  };

  state = {
    nonce: 0,
  };

  _initialValidate() {
    const {
      link: {formState, onValidation},
      validation,
    } = this.props;
    const [value] = formState;
    const {errors} = getExtras(formState);

    if (errors.client === "pending") {
      onValidation([], validation(value));
    }
  }

  componentDidMount() {
    this._initialValidate();
  }

  forceChildRemount() {
    this.setState(({nonce}) => ({nonce: nonce + 1}));
  }

  _handleChildChange: <V>(string, FormState<V>) => void = <V>(
    key: string,
    newChild: FormState<V>
  ) => {
    const newFormState = replaceObjectChild(
      key,
      newChild,
      this.props.link.formState
    );

    const oldValue = this.props.link.formState[0];
    const newValue = newFormState[0];

    const customValue =
      this.props.customChange && this.props.customChange(oldValue, newValue);

    let nextFormState: FormState<T>;
    if (customValue) {
      // Create a fresh form state for the new value.
      // TODO(zach): It's kind of gross that this is happening outside of Form.
      nextFormState = changedFormState(customValue);
    } else {
      nextFormState = newFormState;
    }

    this.props.link.onChange(
      setChanged(validate(this.props.validation, nextFormState))
    );

    // Need to remount children so they will run validations
    if (customValue) {
      this.forceChildRemount();
    }
  };

  _handleChildBlur: <V>(string, ShapedTree<V, Extras>) => void = <V>(
    key: string,
    childTree: ShapedTree<V, Extras>
  ) => {
    const [_, tree] = this.props.link.formState;
    this.props.link.onBlur(
      mapRoot(
        setExtrasTouched,
        dangerouslyReplaceObjectChild(key, childTree, tree)
      )
    );
  };

  _handleChildValidation: <V>(string, ShapedPath<V>, ClientErrors) => void = <
    V
  >(
    key: string,
    childPath: ShapedPath<V>,
    errors: ClientErrors
  ) => {
    const extendedPath = [
      {
        type: "object",
        key,
      },
      ...childPath,
    ];
    this.props.link.onValidation(extendedPath, errors);
  };

  render() {
    const {formState} = this.props.link;
    const {shouldShowError} = this.context;

    const links = makeLinks(
      this.props.link.formState,
      this._handleChildChange,
      this._handleChildBlur,
      this._handleChildValidation
    );
    return (
      <React.Fragment key={this.state.nonce}>
        {this.props.children(links, {
          touched: getExtras(formState).meta.touched,
          changed: getExtras(formState).meta.changed,
          shouldShowErrors: shouldShowError(getExtras(formState).meta),
          unfilteredErrors: flatRootErrors(formState),
          asyncValidationInFlight: false, // no validations on Form
          valid: isValid(formState),
          value: formState[0],
        })}
      </React.Fragment>
    );
  }
}
