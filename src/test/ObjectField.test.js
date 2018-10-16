// @flow

import * as React from "react";
import TestRenderer from "react-test-renderer";
import ObjectField from "../ObjectField";

import {expectLink, mockLink, mockFormState} from "./tools";

describe("ObjectField", () => {
  describe("ObjectField is a field", () => {
    it("validates on mount", () => {
      const validation = jest.fn(() => ["This is an error"]);
      const formState = mockFormState({inner: "value"});
      const link = mockLink(formState);

      TestRenderer.create(
        <ObjectField link={link} validation={validation}>
          {jest.fn(() => null)}
        </ObjectField>
      );

      expect(validation).toHaveBeenCalledTimes(1);
      expect(validation).toHaveBeenCalledWith(formState[0]);
      expect(link.onValidation).toHaveBeenCalledTimes(1);

      const newExtra = link.onValidation.mock.calls[0][0];
      expect(newExtra.data.errors.client).toEqual(["This is an error"]);
    });
  });

  describe("An ObjectField disassembles an object into its fields", () => {
    it("breaks apart a link to an object into an object of links", () => {
      const formStateInner = {
        string: "hello",
        number: 42,
      };
      const formState = mockFormState(formStateInner);
      const link = mockLink(formState);
      const renderFn = jest.fn(() => null);

      TestRenderer.create(<ObjectField link={link}>{renderFn}</ObjectField>);

      expect(renderFn).toHaveBeenCalled();
      const objectLinks = renderFn.mock.calls[0][0];
      expect(Object.keys(objectLinks)).toEqual(Object.keys(objectLinks));
      Object.keys(formStateInner).forEach(k => {
        expect(objectLinks).toHaveProperty(k);
        const link = objectLinks[k];
        expectLink(link);
      });
    });

    it("calls onChange when a child changes", () => {
      const formStateInner = {
        string: "hello",
        number: 42,
      };
      const formState = mockFormState(formStateInner);
      const link = mockLink(formState);
      const renderFn = jest.fn(() => null);

      TestRenderer.create(<ObjectField link={link}>{renderFn}</ObjectField>);

      const objectLinks = renderFn.mock.calls[0][0];
      // call the child onChange
      const newChildMeta = mockFormState("newString");
      objectLinks.string.onChange(newChildMeta);

      expect(link.onChange).toHaveBeenCalled();
      const newObjectFormState = link.onChange.mock.calls[0][0];
      expect(newObjectFormState[0]).toHaveProperty("string", "newString");
      expect(newObjectFormState[1].data.meta).toMatchObject({
        touched: true,
        changed: true,
      });
      expect(newObjectFormState[1].children.string).toBe(newChildMeta[1]);
    });

    it("calls onBlur when a child is blurred", () => {
      const formStateInner = {
        string: "hello",
        number: 42,
      };
      const formState = mockFormState(formStateInner);
      const link = mockLink(formState);
      const renderFn = jest.fn(() => null);

      TestRenderer.create(<ObjectField link={link}>{renderFn}</ObjectField>);

      const objectLinks = renderFn.mock.calls[0][0];
      // call the child onBlur
      const newChildTree = mockFormState("")[1];
      objectLinks.number.onBlur(newChildTree);

      expect(link.onBlur).toHaveBeenCalled();
      const newObjectTree = link.onBlur.mock.calls[0][0];
      expect(newObjectTree.children.number).toBe(newChildTree);
      expect(newObjectTree.data.meta).toMatchObject({
        touched: true,
        changed: false,
      });
    });

    it("calls onValidation when a child runs validations", () => {
      const formStateInner = {
        string: "hello",
        number: 42,
      };
      const formState = mockFormState(formStateInner);
      const link = mockLink(formState);
      const renderFn = jest.fn(() => null);

      TestRenderer.create(<ObjectField link={link}>{renderFn}</ObjectField>);

      const objectLinks = renderFn.mock.calls[0][0];
      // call the child onValidation
      const newChildTree = mockFormState("")[1];
      objectLinks.string.onValidation(newChildTree);

      expect(link.onValidation).toHaveBeenCalledTimes(2);
      // Important: the first call to onValidation is for the initial render validation
      const newObjectTree = link.onValidation.mock.calls[1][0];
      expect(newObjectTree.data.meta).toMatchObject({
        touched: false,
        changed: false,
      });
      expect(newObjectTree.children.string).toBe(newChildTree);
    });

    it("calls its own validation when a child changes", () => {
      const formStateInner = {
        string: "hello",
        number: 42,
      };
      const formState = mockFormState(formStateInner);
      const link = mockLink(formState);
      const renderFn = jest.fn(() => null);
      const validation = jest.fn(() => ["This is an error"]);

      TestRenderer.create(
        <ObjectField link={link} validation={validation}>
          {renderFn}
        </ObjectField>
      );

      expect(validation).toHaveBeenCalledTimes(1);

      const objectLinks = renderFn.mock.calls[0][0];
      // call the child onChange
      const newChildMeta = mockFormState("newString");
      objectLinks.string.onChange(newChildMeta);

      expect(validation).toHaveBeenCalledTimes(2);
      expect(validation.mock.calls[1][0]).toEqual({
        string: "newString",
        number: 42,
      });
    });
  });
});
