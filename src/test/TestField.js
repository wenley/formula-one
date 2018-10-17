import * as React from "react";
import makeField from "../makeField";

export class TestInput extends React.Component<{|
  value: string,
  errors: $ReadOnlyArray<string>,
  onChange: string => void,
  onBlur: () => void,
|}> {
  change(newValue: string) {
    this.props.onChange(newValue);
  }

  blur() {
    this.props.onBlur();
  }
  render() {
    return null;
  }
}

export default makeField(TestInput);
