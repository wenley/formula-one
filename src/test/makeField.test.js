// @flow

import * as React from "react";
import TestRenderer from "react-test-renderer";

import {mockFormState, mockLink} from "./tools";
import TestField, {TestInput} from "./TestField";
import {mapRoot} from "../shapedTree";

describe("makeField()ed component", () => {
  describe("validates on mount", () => {
    it("Sets errors.client and meta.succeeded when there are no errors", () => {
      const formState = mockFormState("Hello world.");
      const link = mockLink(formState);
      const validation = jest.fn(() => []);

      TestRenderer.create(<TestField link={link} validation={validation} />);

      expect(validation).toHaveBeenCalledTimes(1);
      expect(link.onValidation).toHaveBeenCalledTimes(1);

      const newTree = link.onValidation.mock.calls[0][0];
      expect(newTree.data.meta).toMatchObject({
        touched: false,
        changed: false,
        succeeded: true,
      });
      expect(newTree.data.errors).toMatchObject({
        client: [],
      });
    });

    it("Sets errors.client and meta.succeeded when there are errors", () => {
      const formState = mockFormState("Hello world.");
      const link = mockLink(formState);
      const validation = jest.fn(() => ["This is an error"]);

      TestRenderer.create(<TestField link={link} validation={validation} />);

      expect(validation).toHaveBeenCalledTimes(1);
      expect(link.onValidation).toHaveBeenCalledTimes(1);

      const newTree = link.onValidation.mock.calls[0][0];
      expect(newTree.data.meta).toMatchObject({
        touched: false,
        changed: false,
        succeeded: false,
      });
      expect(newTree.data.errors).toMatchObject({
        client: ["This is an error"],
      });
    });

    it("Counts as successfully validated if there is no validation", () => {
      const formState = mockFormState("Hello world.");
      const link = mockLink(formState);

      TestRenderer.create(<TestField link={link} />);

      expect(link.onValidation).toHaveBeenCalledTimes(1);

      const newTree = link.onValidation.mock.calls[0][0];
      expect(newTree.data.meta).toMatchObject({
        touched: false,
        changed: false,
        succeeded: true,
      });
      expect(newTree.data.errors).toMatchObject({
        client: [],
      });
    });
  });
  it("calls the link onChange with new values and correct meta", () => {
    const formState = mockFormState("Hello world.");
    const link = mockLink(formState);

    const renderer = TestRenderer.create(<TestField link={link} />);
    const inner = renderer.root.findByType(TestInput);

    expect(link.onChange).toHaveBeenCalledTimes(0);
    inner.instance.change("You've got mail");
    expect(link.onChange).toHaveBeenCalledTimes(1);

    const [value, tree] = link.onChange.mock.calls[0][0];
    expect(value).toBe("You've got mail");
    expect(tree.data).toMatchObject({
      meta: {
        touched: true,
        changed: true,
        succeeded: true,
      },
    });
  });
  it("calls the link onBlur with correct meta", () => {
    const formState = mockFormState("");
    const link = mockLink(formState);

    const renderer = TestRenderer.create(<TestField link={link} />);
    const inner = renderer.root.findByType(TestInput);

    expect(link.onBlur).toHaveBeenCalledTimes(0);
    inner.instance.blur();
    expect(link.onBlur).toHaveBeenCalledTimes(1);

    const tree = link.onBlur.mock.calls[0][0];
    expect(tree.data).toMatchObject({
      meta: {
        touched: true,
        changed: false,
        succeeded: false,
      },
    });
  });
  it("flattens errors for the inner component", () => {
    let formState = mockFormState("");
    formState[1] = mapRoot(
      oldRoot => ({
        ...oldRoot,
        errors: {
          client: ["Some", "client", "errors"],
          server: ["Server errors", "go here"],
        },
      }),
      formState[1]
    );
    const link = mockLink(formState);

    const renderer = TestRenderer.create(<TestField link={link} />);
    const inner = renderer.root.findByType(TestInput);

    expect(inner.props.errors).toEqual([
      "Some",
      "client",
      "errors",
      "Server errors",
      "go here",
    ]);
  });
});
