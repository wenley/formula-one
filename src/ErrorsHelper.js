// @flow strict

import * as React from "react";
import type {FieldLink, ClientErrors, ServerErrors, Err} from "./types";
import {FormContext} from "./Form";
import {getExtras} from "./formState";

function flattenErrors(errors: Err) {
  let flatErrors = [];
  if (errors.client !== "pending") {
    flatErrors = flatErrors.concat(errors.client);
  }
  if (errors.server !== "unchecked") {
    flatErrors = flatErrors.concat(errors.server);
  }
  return flatErrors;
}

type Props<T> = {|
  +link: FieldLink<T>,
  +children: ({
    shouldShowErrors: boolean,
    client: ClientErrors,
    server: ServerErrors,
    flattened: Array<string>,
  }) => React.Node,
|};
export default function ErrorsHelper<T>(props: Props<T>) {
  const {errors, meta} = getExtras(props.link.formState);
  const flattened = flattenErrors(errors);
  const formContext = React.useContext(FormContext);
  const shouldShowErrors = formContext.shouldShowError(meta);
  return props.children({
    shouldShowErrors,
    client: errors.client,
    server: errors.server,
    flattened,
  });
}
