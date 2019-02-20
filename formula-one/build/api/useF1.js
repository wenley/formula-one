"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const Form_1 = __importDefault(require("../datastructures/Form"));
/** This hook lets you turn in a form schema into a
 * formula-one form object
 * @param initialForm The inital state of your form
 * @return A formula-one form object representing your form */
const useF1 = (initialForm) => {
    const formTree = new Form_1.default(initialForm);
    const [form, updateForm] = react_1.useState(formTree);
    // updateCallback is called whenever any onChange is called
    const updateCallback = () => {
        updateForm(form);
    };
    form.subscribeUpdateCallback(updateCallback);
    return form.formNode;
};
exports.default = useF1;
//# sourceMappingURL=useF1.js.map