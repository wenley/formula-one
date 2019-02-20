"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Link_1 = require("./Link");
/** The main container for formula-one */
class Form {
    constructor(formValue) {
        this.formNode = Link_1.createLink(this, formValue);
    }
    /** resursively subscribes a Form Tree with the update callback
     * @param updateCallback The callback to subscribe recursively */
    subscribeUpdateCallback(updateCallback) {
        Link_1.subscribeUpdateCallback(this.formNode, updateCallback);
    }
}
exports.default = Form;
//# sourceMappingURL=Form.js.map