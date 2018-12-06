// @flow strict

import {moveFromTo, insertSpans} from "../../utils/array";

describe("moveFromTo", () => {
  const a = ["one", "two", "three"];

  it("moves elements in place", () => {
    expect(moveFromTo(1, 1, a)).toEqual(a);
  });

  it("moves elements forward", () => {
    expect(moveFromTo(0, 1, a)).toEqual(["two", "one", "three"]);
  });

  it("moves elements backward", () => {
    expect(moveFromTo(2, 0, a)).toEqual(["three", "one", "two"]);
  });
});

describe("insertSpans", () => {
  it("is identity when given no spans", () => {
    const a = ["one", "two", "three"];
    expect(insertSpans([], [])).toEqual([]);
    expect(insertSpans([], a)).toEqual(a);
  });

  it("inserts a single span", () => {
    const a = ["one", "two", "three"];
    const s = [1, ["hello", "world"]];
    expect(insertSpans([s], a)).toEqual([
      "one",
      "hello",
      "world",
      "two",
      "three",
    ]);
  });

  it("inserts a span at the end of the array", () => {
    const a = ["one", "two", "three"];
    const s = [3, ["the", "end"]];
    expect(insertSpans([s], a)).toEqual(["one", "two", "three", "the", "end"]);
  });

  it("errors if two spans with the same index are provided", () => {
    const redundantSpans = [[0, ["one", "thing"]], [0, ["and", "another"]]];
    expect(() => {
      insertSpans(redundantSpans, []);
    }).toThrowError("at the same index");
  });

  it("inserts multiple spans in the correct place", () => {
    const s0 = [1, ["uno"]];
    const s1 = [2, ["dos"]];
    const a = ["one", "two", "three"];
    expect(insertSpans([s0, s1], a)).toEqual([
      "one",
      "uno",
      "two",
      "dos",
      "three",
    ]);
  });
});
