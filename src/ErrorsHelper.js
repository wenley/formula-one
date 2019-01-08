// @flow strict

import * as React from "react";
import type {FieldLink, ClientErrors, ExternalErrors, Err} from "./types";
import {FormContext, type FormContextPayload} from "./Form";
import {getExtras} from "./formState";

function flattenErrors(errors: Err): $ReadOnlyArray<string> {
  let flatErrors = [];
  if (errors.client !== "pending") {
    flatErrors = flatErrors.concat(errors.client);
  }
  if (errors.external !== "unchecked") {
    flatErrors = flatErrors.concat(errors.external);
  }
  return flatErrors;
}

type Props<T> = {|
  +link: FieldLink<T>,
  +formContext: FormContextPayload,
  +children: ({|
    shouldShowErrors: boolean,
    client: ClientErrors,
    external: ExternalErrors,
    flattenedErrors: $ReadOnlyArray<string>,
  |}) => React.Node,
|};

function ErrorsHelper<T>(props: Props<T>) {
  const {errors, meta} = getExtras(props.link.formState);
  const flattenedErrors = flattenErrors(errors);
  const shouldShowErrors = props.formContext.shouldShowError(meta);
  return props.children({
    shouldShowErrors,
    client: errors.client,
    external: errors.external,
    flattenedErrors,
  });
}

function wrap<E>(props: $Diff<Props<E>, {+formContext: FormContextPayload}>) {
  return (
    <FormContext.Consumer>
      {formContext => <ErrorsHelper {...props} formContext={formContext} />}
    </FormContext.Consumer>
  );
}

wrap.defaultProps = ErrorsHelper.defaultProps;

export default wrap;
