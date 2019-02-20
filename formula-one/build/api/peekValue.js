"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MetaLink_1 = require("../datastructures/MetaLink");
/** Peek a form node's current value
 * @param formNode The node value to peek */
const peekValue = (formNode) => {
    const { valueRef } = formNode[MetaLink_1.linkSymbol];
    return valueRef.getValue();
};
exports.default = peekValue;
//# sourceMappingURL=peekValue.js.map