// @flow strict

import * as React from "react";
import {FormContext, type FormContextPayload} from "./Form";

type InjectedProps = { +formContext: FormContextPayload };

export default function withFormContext<InnerProps: InjectedProps, Instance>(
  Component: React.AbstractComponent<InnerProps, Instance>,
): React.AbstractComponent<InnerProps, Instance> {

  type WithFormContextProps = {
    forwardedRef: React.Ref<typeof Component>,
    ...$Diff<InnerProps, InjectedProps>,
  };

  const WithFormContext = (
    {forwardedRef, ...otherProps}: WithFormContextProps,
  ) => (
    <FormContext.Consumer>
      {formContext => (
        // $FlowFixMe This looks right to me
        <Component
          {...otherProps}
          formContext={formContext}
          ref={forwardedRef}
        />
      )}
    </FormContext.Consumer>
  );

  return React.forwardRef<InnerProps, Instance>((props, ref) => {
    return <WithFormContext {...props} forwardedRef={ref} />;
  });
}
