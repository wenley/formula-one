import Form from './Form';
import Reference from './Reference';
/** Used to access MetaLink from a form Link */
export declare const linkSymbol: unique symbol;
export declare type Validator<T> = (newValue: T) => string[] | string | null;
/** MetaLink is the container for the metadata of a Form's Link
 * It's stored on a Link's LinkSymbol */
declare class MetaLink<HEAD, T> {
    head: Form<HEAD>;
    id: number;
    valueRef: Reference<T>;
    errors: string[];
    updateCallback: (() => void) | null;
    validator: Validator<T> | null;
    constructor(head: Form<HEAD>, data: T);
    subscribeUpdateCallback(updateCallback: () => void): void;
    updateValidator(validator?: Validator<T>): void;
    onChange(newValue: T): void;
    onBlur(newValue: T): void;
}
export default MetaLink;
//# sourceMappingURL=MetaLink.d.ts.map