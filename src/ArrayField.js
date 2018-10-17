// @flow strict

import * as React from "react";

import type {FieldLink, Validation, Extras, ClientErrors} from "./types";
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
} from "./formState";

type ToFieldLink = <T>(T) => FieldLink<T>;
type Links<E> = Array<$Call<ToFieldLink, E>>;

type Props<E> = {|
  +link: FieldLink<Array<E>>,
  +formContext: FormContextPayload,
  +validation: Validation<Array<E>>,
  +children: (
    links: Links<E>,
    {
      addField: (index: number, value: E) => void,
      removeField: (index: number) => void,
      moveField: (oldIndex: number, newIndex: number) => void,
    }
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

class ArrayField<E> extends React.Component<Props<E>> {
  static defaultProps = {
    validation: () => [],
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

  onChildChange: (number, FormState<E>) => void = (
    index: number,
    newChild: FormState<E>
  ) => {
    this.props.link.onChange(
      validate(
        this.props.validation,
        setChanged(
          replaceArrayChild(index, newChild, this.props.link.formState)
        )
      )
    );
  };

  onChildBlur: (number, ShapedTree<E, Extras>) => void = (index, childTree) => {
    const [_, tree] = this.props.link.formState;
    this.props.link.onBlur(
      mapRoot(
        setExtrasTouched,
        dangerouslyReplaceArrayChild(index, childTree, tree)
      )
    );
  };

  onChildValidation: (number, ShapedPath<E>, ClientErrors) => void = (
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

  addChildField: (number, E) => void = (index: number, childValue: E) => {
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

  removeChildField = (index: number) => {
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

  moveChildField = (from: number, to: number) => {
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

    const links = makeLinks(
      formState,
      this.onChildChange,
      this.onChildBlur,
      this.onChildValidation
    );
    return this.props.children(links, {
      addField: this.addChildField,
      removeField: this.removeChildField,
      moveField: this.moveChildField,
    });
  }
}

// Using a HOC here is not possible due to a Flow bug: https://github.com/facebook/flow/issues/6903
export default function(
  props: $Diff<
    React.ElementConfig<typeof ArrayField>,
    {+formContext: FormContextPayload}
  >
) {
  return (
    <FormContext.Consumer>
      {formContext => <ArrayField {...props} formContext={formContext} />}
    </FormContext.Consumer>
  );
}
