// @flow

import {type FormState} from "../formState";
import {type FieldLink} from "../types";
import {treeFromValue} from "../shapedTree";
import {cleanErrors, cleanMeta} from "../types";

export function mockFormState(value: mixed): FormState<mixed> {
  return [
    value,
    treeFromValue(value, {
      errors: cleanErrors,
      meta: cleanMeta,
    }),
  ];
}

export function expectLink(link: any) {
  expect(link).toEqual(
    expect.objectContaining({
      formState: expect.anything(),
      onChange: expect.any(Function),
      onBlur: expect.any(Function),
      onValidation: expect.any(Function),
    })
  );
  expect(Object.keys(link).length).toBe(4);
}

export function mockLink(formState: FormState<any>): FieldLink<any> {
  return {
    formState: formState,
    onChange: jest.fn(),
    onBlur: jest.fn(),
    onValidation: jest.fn(),
  };
}
