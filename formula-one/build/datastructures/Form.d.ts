import { Link } from './Link';
/** The main container for formula-one */
export default class Form<T> {
    formNode: Link<T>;
    constructor(formValue: T);
    /** resursively subscribes a Form Tree with the update callback
     * @param updateCallback The callback to subscribe recursively */
    subscribeUpdateCallback(updateCallback: () => void): void;
}
//# sourceMappingURL=Form.d.ts.map