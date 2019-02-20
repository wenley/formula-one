"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Reference_1 = __importDefault(require("./Reference"));
/** Used to access MetaLink from a form Link */
exports.linkSymbol = Symbol('link');
let nextId = 0;
const getNextId = () => {
    const currentId = nextId;
    nextId += 1;
    return currentId;
};
/** MetaLink is the container for the metadata of a Form's Link
 * It's stored on a Link's LinkSymbol */
class MetaLink {
    constructor(head, data) {
        this.head = head;
        this.id = getNextId();
        this.valueRef = new Reference_1.default(data);
        this.errors = [];
        this.updateCallback = null;
        this.validator = null;
    }
    subscribeUpdateCallback(updateCallback) {
        this.updateCallback = updateCallback;
    }
    updateValidator(validator) {
        this.validator = validator || null;
    }
    onChange(newValue) {
        if (!this.updateCallback || newValue === this.valueRef.value) {
            return;
        }
        if (this.validator) {
            let errors = this.validator(newValue) || [];
            if (typeof errors === 'string') {
                errors = [errors];
            }
            this.errors = errors;
        }
        this.valueRef.updateValue(newValue);
        this.updateCallback();
    }
    onBlur(newValue) {
        //@TODO: I don't know what to do with this
    }
}
exports.default = MetaLink;
//# sourceMappingURL=MetaLink.js.map