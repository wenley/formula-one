// @flow strict

import {moveFromTo, modify, insertSpans} from "../../utils/array";

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

describe("modify", () => {
  it("is identity when given nothing to insert or remove", () => {
    const a = ["one", "two", "three"];

    expect(modify({}, [])).toEqual([]);
    expect(modify({}, a)).toEqual(a);
  });

  describe("inserting spans", () => {
    it("is identity when given no spans", () => {
      const a = ["one", "two", "three"];
      expect(modify({insertSpans: []}, [])).toEqual([]);
      expect(modify({insertSpans: []}, a)).toEqual(a);
    });

    it("inserts a single span", () => {
      const a = ["one", "two", "three"];
      const s = [1, ["hello", "world"]];
      expect(modify({insertSpans: [s]}, a)).toEqual([
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
      expect(modify({insertSpans: [s]}, a)).toEqual([
        "one",
        "two",
        "three",
        "the",
        "end",
      ]);
    });

    it("errors if two spans with the same index are provided", () => {
      const redundantSpans = [[0, ["one", "thing"]], [0, ["and", "another"]]];
      expect(() => {
        modify({insertSpans: redundantSpans}, []);
      }).toThrowError("at the same index");
    });

    it("inserts multiple spans in the correct place", () => {
      const s0 = [1, ["uno"]];
      const s1 = [2, ["dos"]];
      const a = ["one", "two", "three"];
      expect(modify({insertSpans: [s0, s1]}, a)).toEqual([
        "one",
        "uno",
        "two",
        "dos",
        "three",
      ]);
    });
  });

  describe("filtering", () => {
    it("is identity when given (const true)", () => {
      const a = ["one", "two", "three"];

      expect(modify({filterPredicate: () => true}, [])).toEqual([]);
      expect(modify({filterPredicate: () => true}, a)).toEqual(a);
    });

    it("removes everything when given (const false)", () => {
      const a = ["one", "two", "three"];

      expect(modify({filterPredicate: () => false}, [])).toEqual([]);
      expect(modify({filterPredicate: () => false}, a)).toEqual([]);
    });

    it("removes things based on values", () => {
      const a = ["one", "two", "three"];

      expect(modify({filterPredicate: s => s === "one"}, [])).toEqual([]);
      expect(modify({filterPredicate: s => s === "one"}, a)).toEqual(["one"]);
      expect(modify({filterPredicate: s => s !== "one"}, a)).toEqual([
        "two",
        "three",
      ]);
    });

    it("removes things based on index", () => {
      const a = ["one", "two", "three"];

      expect(modify({filterPredicate: (_, i) => i === 1}, [])).toEqual([]);
      expect(modify({filterPredicate: (_, i) => i === 1}, a)).toEqual(["two"]);
      expect(modify({filterPredicate: (_, i) => i !== 1}, a)).toEqual([
        "one",
        "three",
      ]);
    });

    it("removes things based on the whole array", () => {
      const a = ["one", "two", "three"];

      const pred = jest.fn();
      modify({filterPredicate: pred}, a);
      expect(pred).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        a
      );

      expect(
        modify(
          {
            filterPredicate: (_0, i, arr) =>
              i + 1 < arr.length && arr[i + 1] === "three",
          },
          a
        )
      ).toEqual(["two"]);
    });
  });

  describe("inserting and filtering simultaneously", () => {
    it("can insert and remove simultaneously", () => {
      expect(
        modify(
          {
            insertSpans: [[0, ["front"]], [3, ["middle", "content"]]],
            filterPredicate: (_, i) => !(i === 0 || i === 2 || i === 3),
          },
          ["one", "two", "three", "four", "five"]
        )
      ).toEqual(["front", "two", "middle", "content", "five"]);
    });
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
