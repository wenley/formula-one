// @flow

import * as React from "react";
import TestRenderer from "react-test-renderer";
import Form, {FormContext} from "../Form";
import ObjectField from "../ObjectField";
import ArrayField from "../ArrayField";

import {expectLink, mockFormState} from "./tools";
import TestField from "./TestField";
import {forgetShape} from "../shapedTree";

describe("Form", () => {
  describe("Form manages form state", () => {
    it("creates the initial formState from initialValue and serverErrors", () => {
      const onSubmit = jest.fn();
      const renderFn = jest.fn(() => null);
      TestRenderer.create(
        <Form
          initialValue={1}
          feedbackStrategy="OnFirstTouch"
          onSubmit={onSubmit}
          serverErrors={{"/": ["Server error", "Another server error"]}}
        >
          {renderFn}
        </Form>
      );

      expect(renderFn).toHaveBeenCalled();

      const link = renderFn.mock.calls[0][0];
      expectLink(link);

      const [value, tree] = link.formState;
      expect(value).toBe(1);
      expect(forgetShape(tree).type).toBe("leaf");
      expect(forgetShape(tree).data).toEqual({
        meta: {
          touched: false,
          changed: false,
          succeeded: false,
          asyncValidationInFlight: false,
        },
        errors: {
          client: "pending",
          server: ["Server error", "Another server error"],
        },
      });
    });

    it("parses and sets complex server errors", () => {
      const onSubmit = jest.fn();
      const renderFn = jest.fn(() => null);
      TestRenderer.create(
        <Form
          initialValue={{
            simple: 3,
            complex: [{inner: "hello"}, {inner: "there"}],
          }}
          feedbackStrategy="OnFirstTouch"
          onSubmit={onSubmit}
          serverErrors={{
            "/": ["Root error"],
            "/simple": ["One", "level", "down"],
            "/complex": [],
            "/complex/0": ["in an", "array"],
          }}
        >
          {renderFn}
        </Form>
      );

      expect(renderFn).toHaveBeenCalled();

      const link = renderFn.mock.calls[0][0];
      expectLink(link);

      const [_, tree] = link.formState;
      // Cross your fingers
      const root: any = tree;
      expect(root.data.errors.server).toEqual(["Root error"]);
      const simple = root.children.simple;
      expect(simple.data.errors.server).toEqual(["One", "level", "down"]);
      const complex = root.children.complex;
      expect(complex.data.errors.server).toEqual([]);
      const complex0 = complex.children[0];
      expect(complex0.data.errors.server).toEqual(["in an", "array"]);
      const complex1 = complex.children[1];
      expect(complex1.data.errors.server).toEqual([]);
    });

    xit("??? resets the server errors when they change -- this actually belongs lower?", () => {
      throw "TODO";
    });

    it("collects the initial validations", () => {
      // This test is not very unit-y, but that's okay! It's more useful to
      // know that it's working with ArrayField and ObjectField and Field

      const onSubmit = jest.fn();
      const renderer = TestRenderer.create(
        <Form
          initialValue={{
            errors: "foo",
            noErrors: "bar",
            array: ["baz", "quux"],
          }}
          feedbackStrategy="OnFirstTouch"
          onSubmit={onSubmit}
          serverErrors={null}
        >
          {link => (
            <ObjectField link={link} validation={() => ["Toplevel error"]}>
              {link => (
                <React.Fragment>
                  <TestField
                    link={link.errors}
                    validation={() => ["Two", "errors"]}
                  />
                  <TestField link={link.noErrors} />
                  <ArrayField
                    link={link.array}
                    validation={() => ["Array errors"]}
                  >
                    {links =>
                      links.map((link, i) => (
                        <TestField
                          key={i}
                          link={link}
                          validation={
                            i === 1
                              ? () => ["Errors on the second item"]
                              : () => []
                          }
                        />
                      ))
                    }
                  </ArrayField>
                </React.Fragment>
              )}
            </ObjectField>
          )}
        </Form>
      );

      // Cross your fingers
      const root: any = forgetShape(renderer.root.instance.state.formState[1]);
      expect(root.data.errors.client).toEqual(["Toplevel error"]);
      const errors = root.children.errors;
      expect(errors.data.errors.client).toEqual(["Two", "errors"]);
      const noErrors = root.children.noErrors;
      expect(noErrors.data.errors.client).toEqual([]);
      const array = root.children.array;
      expect(array.data.errors.client).toEqual(["Array errors"]);
      const array0 = array.children[0];
      expect(array0.data.errors.client).toEqual([]);
      const array1 = array.children[1];
      expect(array1.data.errors.client).toEqual(["Errors on the second item"]);
    });

    it("changes when link calls onChange", () => {
      const onSubmit = jest.fn();
      const renderFn = jest.fn(() => null);
      const renderer = TestRenderer.create(
        <Form
          initialValue={1}
          feedbackStrategy="OnFirstTouch"
          onSubmit={onSubmit}
          serverErrors={null}
        >
          {renderFn}
        </Form>
      );

      const link = renderFn.mock.calls[0][0];

      const newFormState = mockFormState(2);
      link.onChange(newFormState);

      expect(renderer.root.instance.state.formState).toBe(newFormState);
    });
    it("changes when link calls onBlur", () => {
      const onSubmit = jest.fn();
      const renderFn = jest.fn(() => null);
      const renderer = TestRenderer.create(
        <Form
          initialValue={1}
          feedbackStrategy="OnFirstTouch"
          onSubmit={onSubmit}
          serverErrors={null}
        >
          {renderFn}
        </Form>
      );

      const link = renderFn.mock.calls[0][0];

      const [_, newTree] = mockFormState(2);
      link.onBlur(newTree);

      expect(renderer.root.instance.state.formState[1]).toBe(newTree);
    });
  });

  describe("Form manages form-level meta information", () => {
    it("tracks whether the form has been modified", () => {
      const onSubmit = jest.fn();
      const contextExtractor = jest.fn(() => null);
      const renderFn = jest.fn(() => (
        <FormContext.Consumer>{contextExtractor}</FormContext.Consumer>
      ));
      TestRenderer.create(
        <Form
          initialValue={1}
          feedbackStrategy="OnFirstTouch"
          onSubmit={onSubmit}
          serverErrors={{"/": ["Server error", "Another server error"]}}
        >
          {renderFn}
        </Form>
      );

      expect(contextExtractor).toHaveBeenCalledWith(
        expect.objectContaining({
          pristine: true,
        })
      );

      const link = renderFn.mock.calls[0][0];
      const nextFormState = mockFormState(2);
      link.onChange(nextFormState);

      expect(contextExtractor).toHaveBeenLastCalledWith(
        expect.objectContaining({
          pristine: false,
        })
      );
    });

    it("tracks whether the form has been submitted", () => {
      const contextExtractor = jest.fn(() => null);
      const renderFn = jest.fn(() => (
        <FormContext.Consumer>{contextExtractor}</FormContext.Consumer>
      ));
      TestRenderer.create(
        <Form
          initialValue={1}
          feedbackStrategy="OnFirstTouch"
          onSubmit={jest.fn()}
          serverErrors={{"/": ["Server error", "Another server error"]}}
        >
          {renderFn}
        </Form>
      );

      expect(contextExtractor).toHaveBeenCalledWith(
        expect.objectContaining({
          submitted: false,
        })
      );

      const onSubmit = renderFn.mock.calls[0][1];
      onSubmit();

      expect(contextExtractor).toHaveBeenLastCalledWith(
        expect.objectContaining({
          submitted: true,
        })
      );
    });

    it("gives children a shouldShowError", () => {
      const onSubmit = jest.fn();
      const contextExtractor = jest.fn(() => null);
      const renderFn = () => (
        <FormContext.Consumer>{contextExtractor}</FormContext.Consumer>
      );
      TestRenderer.create(
        <Form
          initialValue={1}
          feedbackStrategy="OnFirstTouch"
          onSubmit={onSubmit}
          serverErrors={{"/": ["Server error", "Another server error"]}}
        >
          {renderFn}
        </Form>
      );

      expect(contextExtractor).toHaveBeenCalledWith(
        expect.objectContaining({
          shouldShowError: expect.any(Function),
        })
      );
    });
  });

  it("Calls onSubmit with the value when submitted", () => {
    const onSubmit = jest.fn();
    const contextExtractor = jest.fn(() => null);
    const renderFn = jest.fn(() => (
      <FormContext.Consumer>{contextExtractor}</FormContext.Consumer>
    ));
    TestRenderer.create(
      <Form
        initialValue={1}
        feedbackStrategy="OnFirstTouch"
        onSubmit={onSubmit}
        serverErrors={{"/": ["Server error", "Another server error"]}}
      >
        {renderFn}
      </Form>
    );

    expect(onSubmit).toHaveBeenCalledTimes(0);

    const linkOnSubmit = renderFn.mock.calls[0][1];
    linkOnSubmit();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenLastCalledWith(1);
  });
});
