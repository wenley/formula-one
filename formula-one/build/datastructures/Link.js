"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MetaLink_1 = __importStar(require("./MetaLink"));
/** creates a link from a given datum
 * @param head The parent Form
 * @param formData The form data to create a Link from
 * @return The created recursive link */
exports.createLink = (head, formData) => {
    /* ValueRef is a reference tree. The below procedure hooks up
     * the valueRef upwards */
    const link = { [MetaLink_1.linkSymbol]: new MetaLink_1.default(head, formData) };
    if (Array.isArray(formData)) {
        const arrayLink = [];
        arrayLink[MetaLink_1.linkSymbol] = new MetaLink_1.default(head, formData);
        arrayLink[MetaLink_1.linkSymbol].valueRef.value = [];
        formData.forEach((datum, i) => {
            const childNode = exports.createLink(head, datum);
            arrayLink[MetaLink_1.linkSymbol].valueRef.value[i] = childNode[MetaLink_1.linkSymbol].valueRef;
            arrayLink[i] = childNode;
        });
        return arrayLink;
    }
    else if (typeof formData === 'object' && formData !== null) {
        link[MetaLink_1.linkSymbol].valueRef.value = {};
        Object.keys(formData).forEach(key => {
            const value = formData[key];
            const childNode = exports.createLink(head, value);
            link[MetaLink_1.linkSymbol].valueRef.value[key] = childNode[MetaLink_1.linkSymbol].valueRef;
            link[key] = childNode;
        });
    }
    return link;
};
/** resursively subscribes a Link with the update callback
 * @param link The link to recursively subscribe
 * @param updateCallback The callback to subscribe recursively */
exports.subscribeUpdateCallback = (link, updateCallback) => {
    link[MetaLink_1.linkSymbol].subscribeUpdateCallback(updateCallback);
    if (typeof link === 'object') {
        Object.keys(link).forEach(key => {
            const childLink = link[key];
            exports.subscribeUpdateCallback(childLink, updateCallback);
        });
    }
};
/** Recursively traverses a link for errors
 * @param link The link to recursively traverse for errors
 * @return The retrieved errors */
exports.recurisvelyGetErrors = (link) => {
    const errors = [...link[MetaLink_1.linkSymbol].errors];
    if (Array.isArray(link)) {
        link.forEach(child => {
            errors.push(...exports.recurisvelyGetErrors(child));
        });
    }
    else if (typeof link === 'object' && link !== null) {
        Object.keys(link).forEach(key => {
            const child = link[key];
            errors.push(...exports.recurisvelyGetErrors(child));
        });
    }
    return errors;
};
//# sourceMappingURL=Link.js.map