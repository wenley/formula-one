// @flow

import * as React from "react";
import TestRenderer from "react-test-renderer";
import ArrayField from "../ArrayField";
import {type FieldLink} from "../types";

import {expectLink, mockLink, mockFormState} from "./tools";

describe("ArrayField", () => {
  describe("ArrayField is a field", () => {
    describe("validates on mount", () => {
      it("ensures that the link inner type matches the type of the validation", () => {
        const formState = mockFormState(["one", "two", "three"]);
        const link = mockLink(formState);

        // $ExpectError
        <ArrayField link={link} validation={(_e: empty) => []}>
          {() => null}
        </ArrayField>;

        <ArrayField link={link} validation={(_e: Array<string>) => []}>
          {() => null}
        </ArrayField>;
      });

      it("Sets errors.client and meta.succeeded when there are no errors", () => {
        const validation = jest.fn(() => []);
        const formState = mockFormState([]);
        const link = mockLink(formState);

        TestRenderer.create(
          <ArrayField link={link} validation={validation}>
            {jest.fn(() => null)}
          </ArrayField>
        );

        expect(validation).toHaveBeenCalledTimes(1);
        expect(validation).toHaveBeenCalledWith(formState[0]);
        expect(link.onValidation).toHaveBeenCalledTimes(1);

        const [path, errors] = link.onValidation.mock.calls[0];
        expect(path).toEqual([]);
        expect(errors).toEqual([]);
      });

      it("Sets errors.client and meta.succeeded when there are errors", () => {
        const validation = jest.fn(() => ["This is an error", "another error"]);
        const formState = mockFormState([]);
        const link = mockLink(formState);

        TestRenderer.create(
          <ArrayField link={link} validation={validation}>
            {jest.fn(() => null)}
          </ArrayField>
        );

        expect(validation).toHaveBeenCalledTimes(1);
        expect(validation).toHaveBeenCalledWith(formState[0]);
        expect(link.onValidation).toHaveBeenCalledTimes(1);

        const [path, errors] = link.onValidation.mock.calls[0];
        expect(path).toEqual([]);
        expect(errors).toEqual(["This is an error", "another error"]);
      });

      it("Treats no validation as always passing", () => {
        const formState = mockFormState([]);
        const link = mockLink(formState);

        TestRenderer.create(
          <ArrayField link={link}>{jest.fn(() => null)}</ArrayField>
        );

        expect(link.onValidation).toHaveBeenCalledTimes(1);

        const [path, errors] = link.onValidation.mock.calls[0];
        expect(path).toEqual([]);
        expect(errors).toEqual([]);
      });

      it("Passes additional information to its render function", () => {
        const formState = mockFormState(["value"]);
        // $FlowFixMe
        formState[1].data.errors = {
          server: ["A server error"],
          client: ["A client error"],
        };
        const link = mockLink(formState);
        const renderFn = jest.fn(() => null);

        TestRenderer.create(<ArrayField link={link}>{renderFn}</ArrayField>);

        expect(renderFn).toHaveBeenCalled();
        expect(renderFn).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            touched: false,
            changed: false,
            shouldShowErrors: expect.anything(),
            unfilteredErrors: expect.arrayContaining([
              "A server error",
              "A client error",
            ]),
            valid: false,
            asyncValidationInFlight: false,
            value: ["value"],
          })
        );
      });
    });
  });

  describe("An ArrayField disassembles an array into each item", () => {
    it("breaks apart a link into an array of links", () => {
      const formStateValue = ["one", "two", "three"];
      const formState = mockFormState(formStateValue);
      const link = mockLink(formState);
      const renderFn = jest.fn(() => null);

      TestRenderer.create(<ArrayField link={link}>{renderFn}</ArrayField>);

      expect(renderFn).toHaveBeenCalled();
      const arrayLinks = renderFn.mock.calls[0][0];
      expect(arrayLinks.length).toBe(3);
      arrayLinks.forEach(expectLink);
    });

    it("has the correct type for the links object", () => {
      const formState = mockFormState(["one", "two", "three"]);
      const link = mockLink(formState);

      <ArrayField link={link}>
        {/* $ExpectError */}
        {(links: empty) => {
          console.log(links);
          return null;
        }}
      </ArrayField>;

      <ArrayField link={link}>
        {(links: Array<FieldLink<string>>) => {
          console.log(links);
          return null;
        }}
      </ArrayField>;
    });

    it("calls onChange when a child changes", () => {
      const formStateValue = ["one", "two", "three"];
      const formState = mockFormState(formStateValue);
      const link = mockLink(formState);
      const renderFn = jest.fn(() => null);

      TestRenderer.create(<ArrayField link={link}>{renderFn}</ArrayField>);

      const arrayLinks = renderFn.mock.calls[0][0];
      const newElementFormState = mockFormState("newTwo");
      arrayLinks[1].onChange(newElementFormState);

      expect(link.onChange).toHaveBeenCalled();
      const newArrayFormState = link.onChange.mock.calls[0][0];
      expect(newArrayFormState[0]).toEqual(["one", "newTwo", "three"]);
      expect(newArrayFormState[1].data.meta).toMatchObject({
        touched: true,
        changed: true,
      });
      expect(newArrayFormState[1].children[1]).toBe(newElementFormState[1]);
    });

    it("calls onBlur when a child is blurred", () => {
      const formStateValue = ["one", "two", "three"];
      const formState = mockFormState(formStateValue);
      const link = mockLink(formState);
      const renderFn = jest.fn(() => null);

      TestRenderer.create(<ArrayField link={link}>{renderFn}</ArrayField>);

      const arrayLinks = renderFn.mock.calls[0][0];
      const newElementTree = mockFormState("")[1];
      arrayLinks[0].onBlur(newElementTree);

      expect(link.onBlur).toHaveBeenCalled();
      const newArrayTree = link.onBlur.mock.calls[0][0];
      expect(newArrayTree.data.meta).toMatchObject({
        touched: true,
        changed: false,
      });
      expect(newArrayTree.children[0]).toBe(newElementTree);
    });

    it("calls onValidation when a child initially validates", () => {
      const formStateValue = ["one", "two", "three"];
      const formState = mockFormState(formStateValue);
      const link = mockLink(formState);
      const renderFn = jest.fn(() => null);

      TestRenderer.create(<ArrayField link={link}>{renderFn}</ArrayField>);

      const arrayLinks = renderFn.mock.calls[0][0];
      arrayLinks[2].onValidation([], ["These are", "some errors"]);

      expect(link.onValidation).toHaveBeenCalledTimes(2);
      // Important: the first call to onValidation is for the initial render validation
      const [path, errors] = link.onValidation.mock.calls[1];
      expect(path).toEqual([{type: "array", index: 2}]);
      expect(errors).toEqual(["These are", "some errors"]);
    });

    it("calls its validation when a child changes", () => {
      const formStateValue = ["one", "two", "three"];
      const formState = mockFormState(formStateValue);
      const link = mockLink(formState);
      const renderFn = jest.fn(() => null);
      const validation = jest.fn(() => ["This is an error"]);

      TestRenderer.create(
        <ArrayField link={link} validation={validation}>
          {renderFn}
        </ArrayField>
      );

      expect(validation).toHaveBeenCalledTimes(1);

      const arrayLinks = renderFn.mock.calls[0][0];
      const newElementFormState = mockFormState("newOne");
      arrayLinks[0].onChange(newElementFormState);

      expect(validation).toHaveBeenCalledTimes(2);
      expect(validation).toHaveBeenLastCalledWith(["newOne", "two", "three"]);
    });
  });

  describe("An ArrayField provides a way to modify the array", () => {
    describe("addField", () => {
      it("exposes addField to add an entry", () => {
        const formStateValue = ["one", "two", "three"];
        const formState = mockFormState(formStateValue);
        const link = mockLink(formState);
        const renderFn = jest.fn(() => null);

        TestRenderer.create(<ArrayField link={link}>{renderFn}</ArrayField>);

        expect(renderFn).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            addField: expect.any(Function),
          }),
          expect.anything()
        );
      });
      it("validates after entry is added", () => {
        const formStateValue = ["one", "two", "three"];
        const formState = mockFormState(formStateValue);
        const link = mockLink(formState);
        const renderFn = jest.fn(() => null);
        const validation = jest.fn(() => ["an error"]);

        TestRenderer.create(
          <ArrayField validation={validation} link={link}>
            {renderFn}
          </ArrayField>
        );

        expect(validation).toHaveBeenCalledTimes(1);

        const [_, {addField}] = renderFn.mock.calls[0];
        addField(0, "zero");

        expect(validation).toHaveBeenCalledTimes(2);
        expect(validation).toHaveBeenLastCalledWith([
          "zero",
          "one",
          "two",
          "three",
        ]);
      });
    });

    describe("removeField", () => {
      it("exposes removeField to remove an entry", () => {
        const formStateValue = ["one", "two", "three"];
        const formState = mockFormState(formStateValue);
        const link = mockLink(formState);
        const renderFn = jest.fn(() => null);

        TestRenderer.create(<ArrayField link={link}>{renderFn}</ArrayField>);

        expect(renderFn).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            removeField: expect.any(Function),
          }),
          expect.anything()
        );
      });
      it("validates after entry is removed", () => {
        const formStateValue = ["one", "two", "three"];
        const formState = mockFormState(formStateValue);
        const link = mockLink(formState);
        const renderFn = jest.fn(() => null);
        const validation = jest.fn(() => ["an error"]);

        TestRenderer.create(
          <ArrayField validation={validation} link={link}>
            {renderFn}
          </ArrayField>
        );

        expect(validation).toHaveBeenCalledTimes(1);

        const [_, {removeField}] = renderFn.mock.calls[0];
        removeField(1);

        expect(validation).toHaveBeenCalledTimes(2);
        expect(validation).toHaveBeenLastCalledWith(["one", "three"]);
      });
    });

    describe("moveField", () => {
      it("exposes moveField to move an entry", () => {
        const formStateValue = ["one", "two", "three"];
        const formState = mockFormState(formStateValue);
        const link = mockLink(formState);
        const renderFn = jest.fn(() => null);

        TestRenderer.create(<ArrayField link={link}>{renderFn}</ArrayField>);

        expect(renderFn).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            moveField: expect.any(Function),
          }),
          expect.anything()
        );
      });
      it("validates after the entry is moved", () => {
        const formStateValue = ["one", "two", "three"];
        const formState = mockFormState(formStateValue);
        const link = mockLink(formState);
        const renderFn = jest.fn(() => null);
        const validation = jest.fn(() => ["an error"]);

        TestRenderer.create(
          <ArrayField validation={validation} link={link}>
            {renderFn}
          </ArrayField>
        );

        expect(validation).toHaveBeenCalledTimes(1);

        const [_, {moveField}] = renderFn.mock.calls[0];
        moveField(2, 1);

        expect(validation).toHaveBeenCalledTimes(2);
        expect(validation).toHaveBeenLastCalledWith(["one", "three", "two"]);
      });
    });
  });
});
