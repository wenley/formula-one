import * as React from "react";

function DefaultInput(props: {
  label: string;
  error: string;
  showError: boolean;
  children: React.ReactChild;
}) {
  return (
    <div>
      <label>
        {props.label}
        {props.children}
      </label>
      <span style={{marginLeft: 5}}>{props.showError && props.error}</span>
    </div>
  );
}

interface InputWrapperContextPayload {
  InputWrapper: React.ComponentType<{
    label: string;
    error: string;
    showError: boolean;
    children: React.ReactNode;
  }>;
}
const InputWrapperContext = React.createContext({
  InputWrapper: DefaultInput,
}) as React.Context<InputWrapperContextPayload>;

export default InputWrapperContext;
