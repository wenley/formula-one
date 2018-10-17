// @flow strict

import * as React from "react";

import type {FieldLink, Validation, Extras, ClientErrors} from "./types";
import {type FormContextPayload} from "./Form";
import {FormContext} from "./Form";
import {
  type FormState,
  setChanged,
  replaceObjectChild,
  setExtrasTouched,
  objectChild,
  validate,
  getExtras,
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
  +formContext: FormContextPayload,
  +validation: Validation<T>,
  +children: (links: Links<T>) => React.Node,
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

class ObjectField<T: {}> extends React.Component<Props<T>> {
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

  onChildChange: <V>(string, FormState<V>) => void = <V>(
    key: string,
    newChild: FormState<V>
  ) => {
    this.props.link.onChange(
      setChanged(
        validate(
          this.props.validation,
          replaceObjectChild(key, newChild, this.props.link.formState)
        )
      )
    );
  };

  onChildBlur: <V>(string, ShapedTree<V, Extras>) => void = <V>(
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

  onChildValidation: <V>(string, ShapedPath<V>, ClientErrors) => void = <V>(
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
    const links = makeLinks(
      this.props.link.formState,
      this.onChildChange,
      this.onChildBlur,
      this.onChildValidation
    );
    return this.props.children(links);
  }
}

// Using a HOC here is not possible due to a Flow bug: https://github.com/facebook/flow/issues/6903
export default function(
  props: $Diff<
    React.ElementConfig<typeof ObjectField>,
    {+formContext: FormContextPayload}
  >
) {
  return (
    <FormContext.Consumer>
      {formContext => <ObjectField {...props} formContext={formContext} />}
    </FormContext.Consumer>
  );
}
