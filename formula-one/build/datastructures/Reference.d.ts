/**
 * A reference turns a value into a reference to a value and
 * exposes methods to update and retrieve the value
 */
declare class Reference<T> {
    value: T;
    constructor(value: T);
    updateValue(newValue: T): void;
    /** Converts a nested reference into an object
     * @param reference The reference to deconstruct
     * @return The data the nested reference conists of */
    getValue(): any;
}
export default Reference;
//# sourceMappingURL=Reference.d.ts.map