// @flow

import {type Tree, mapTree, foldMapTree} from "../tree";

const sampleTree: Tree<string> = {
  type: "object",
  data: "root",
  children: {
    left: {
      type: "leaf",
      data: "left",
    },
    right: {
      type: "array",
      data: "right",
      children: [
        {
          type: "leaf",
          data: "zero",
        },
        {
          type: "leaf",
          data: "one",
        },
      ],
    },
  },
};

describe("tree", () => {
  it("can be mapped over", () => {
    const mappedTree = mapTree(s => s.length, sampleTree);

    const untypedRoot: any = mappedTree;
    expect(untypedRoot.type).toBe("object");
    expect(untypedRoot.data).toBe(4);
    const left = untypedRoot.children.left;
    expect(left.type).toBe("leaf");
    expect(left.data).toBe(4);
    const right = untypedRoot.children.right;
    expect(right.type).toBe("array");
    expect(right.data).toBe(5);
    const zero = right.children[0];
    expect(zero.type).toBe("leaf");
    expect(zero.data).toBe(4);
    const one = right.children[1];
    expect(one.type).toBe("leaf");
    expect(one.data).toBe(3);
  });

  it("can be folded into a monoid preorder", () => {
    const id = x => x;
    const folded = foldMapTree(id, "", (x, y) => x.concat(y), sampleTree);
    expect(folded).toBe("rootleftrightzeroone");
  });
});
