"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Link_1 = require("../datastructures/Link");
const MetaLink_1 = require("../datastructures/MetaLink");
/**
 * Provides utils for working with arrays in forms
 * @param Link The array link to provide utils for
 * @param defaultVal The default value that will be used when adding
 * a field to the Link */
const arrayUtils = (link, defaultVal) => {
    if (!Array.isArray(link)) {
        throw new TypeError('ArrayUtil must only be used on Array Links');
    }
    const addField = () => {
        const newLink = Link_1.createLink(link[MetaLink_1.linkSymbol].head, defaultVal);
        link[MetaLink_1.linkSymbol].valueRef.value[link.length] = newLink[MetaLink_1.linkSymbol].valueRef;
        link.push(newLink);
        link[MetaLink_1.linkSymbol].updateCallback();
    };
    const removeField = (index) => {
        const metaLink = link[MetaLink_1.linkSymbol];
        link.splice(index, 1);
        link[MetaLink_1.linkSymbol].valueRef.value = [
            ...metaLink.valueRef.value.slice(0, index),
            ...metaLink.valueRef.value.slice(index + 1)
        ];
        link[MetaLink_1.linkSymbol].updateCallback();
    };
    return [addField, removeField];
};
exports.default = arrayUtils;
//# sourceMappingURL=arrayUtils.js.map