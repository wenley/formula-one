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
import {cleanErrors, cleanMeta} from "./types";
import {
  type ShapedTree,
  type ShapedPath,
  treeFromValue,
  dangerouslyReplaceArrayChild,
  mapRoot,
  dangerouslySetChildren,
  shapedArrayChildren,
} from "./shapedTree";
import {removeAt, moveFromTo, insertAt} from "./utils/array";
import {FormContext, type FormContextPayload} from "./Form";
import {
  type FormState,
  replaceArrayChild,
  setTouched,
  setChanged,
  setExtrasTouched,
  arrayChild,
  validate,
  getExtras,
  flatRootErrors,
  isValid,
  changedFormState,
} from "./formState";

type ToFieldLink = <T>(T) => FieldLink<T>;
type Links<E> = Array<$Call<ToFieldLink, E>>;

type Props<E> = {|
  +link: FieldLink<Array<E>>,
  +formContext: FormContextPayload,
  +validation: Validation<Array<E>>,
  +customChange?: CustomChange<Array<E>>,
  +children: (
    links: Links<E>,
    arrayOperations: {
      addField: (index: number, value: E) => void,
      removeField: (index: number) => void,
      moveField: (oldIndex: number, newIndex: number) => void,
    },
    additionalInfo: AdditionalRenderInfo<Array<E>>
  ) => React.Node,
|};

function makeLinks<E>(
  formState: FormState<Array<E>>,
  onChildChange: (number, FormState<E>) => void,
  onChildBlur: (number, ShapedTree<E, Extras>) => void,
  onChildValidation: (number, ShapedPath<E>, ClientErrors) => void
): Links<E> {
  const [oldValue] = formState;
  return oldValue.map((x, i) => {
    return {
      formState: arrayChild(i, formState),
      onChange: childFormState => {
        onChildChange(i, childFormState);
      },
      onBlur: childTree => {
        onChildBlur(i, childTree);
      },
      onValidation: (childPath, clientErrors) => {
        onChildValidation(i, childPath, clientErrors);
      },
    };
  });
}

type State = {|
  nonce: number,
|};

class ArrayField<E> extends React.Component<Props<E>, State> {
  static defaultProps = {
    validation: () => [],
  };

  state = {
    nonce: 0,
  };

  initialValidate() {
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
    this.initialValidate();
  }

  forceChildRemount() {
    this.setState(({nonce}) => ({nonce: nonce + 1}));
  }

  _handleChildChange: (number, FormState<E>) => void = (
    index: number,
    newChild: FormState<E>
  ) => {
    const newFormState = replaceArrayChild(
      index,
      newChild,
      this.props.link.formState
    );

    const oldValue = this.props.link.formState[0];
    const newValue = newFormState[0];

    const customValue =
      this.props.customChange && this.props.customChange(oldValue, newValue);

    let nextFormState: FormState<Array<E>>;
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

  _handleChildBlur: (number, ShapedTree<E, Extras>) => void = (
    index,
    childTree
  ) => {
    const [_, tree] = this.props.link.formState;
    this.props.link.onBlur(
      mapRoot(
        setExtrasTouched,
        dangerouslyReplaceArrayChild(index, childTree, tree)
      )
    );
  };

  _handleChildValidation: (number, ShapedPath<E>, ClientErrors) => void = (
    index,
    childPath,
    errors
  ) => {
    const extendedPath = [
      {
        type: "array",
        index,
      },
      ...childPath,
    ];
    this.props.link.onValidation(extendedPath, errors);
  };

  _addChildField: (number, E) => void = (index: number, childValue: E) => {
    const [oldValue, oldTree] = this.props.link.formState;
    const cleanNode = {
      errors: cleanErrors,
      meta: cleanMeta,
    };

    const newValue = insertAt(index, childValue, oldValue);
    const newTree = dangerouslySetChildren(
      insertAt(
        index,
        treeFromValue(childValue, cleanNode),
        shapedArrayChildren(oldTree)
      ),
      oldTree
    );

    this.props.link.onChange(
      validate(
        this.props.validation,
        setChanged(setTouched([newValue, newTree]))
      )
    );
  };

  _removeChildField = (index: number) => {
    const [oldValue, oldTree] = this.props.link.formState;

    const newValue = removeAt(index, oldValue);
    const newTree = dangerouslySetChildren(
      removeAt(index, shapedArrayChildren(oldTree)),
      oldTree
    );

    this.props.link.onChange(
      validate(
        this.props.validation,
        setChanged(setTouched([newValue, newTree]))
      )
    );
  };

  _moveChildField = (from: number, to: number) => {
    const [oldValue, oldTree] = this.props.link.formState;

    const newValue = moveFromTo(from, to, oldValue);
    const newTree = dangerouslySetChildren(
      moveFromTo(from, to, shapedArrayChildren(oldTree)),
      oldTree
    );
    this.props.link.onChange(
      validate(
        this.props.validation,
        setChanged(setTouched([newValue, newTree]))
      )
    );
  };

  render() {
    const {formState} = this.props.link;
    const {shouldShowError} = this.props.formContext;

    const links = makeLinks(
      formState,
      this._handleChildChange,
      this._handleChildBlur,
      this._handleChildValidation
    );
    return (
      <React.Fragment key={this.state.nonce}>
        {this.props.children(
          links,
          {
            addField: this._addChildField,
            removeField: this._removeChildField,
            moveField: this._moveChildField,
          },
          {
            touched: getExtras(formState).meta.touched,
            changed: getExtras(formState).meta.changed,
            shouldShowErrors: shouldShowError(getExtras(formState).meta),
            unfilteredErrors: flatRootErrors(formState),
            asyncValidationInFlight: false, // no validations on Form
            valid: isValid(formState),
            value: formState[0],
          }
        )}
      </React.Fragment>
    );
  }
}

// Using a HOC here is not possible due to a Flow bug: https://github.com/facebook/flow/issues/6903
function wrap<E>(props: $Diff<Props<E>, {+formContext: FormContextPayload}>) {
  return (
    <FormContext.Consumer>
      {formContext => <ArrayField {...props} formContext={formContext} />}
    </FormContext.Consumer>
  );
}
wrap.defaultProps = ArrayField.defaultProps;

export default wrap;
