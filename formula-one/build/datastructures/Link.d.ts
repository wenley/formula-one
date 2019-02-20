import Form from './Form';
/** A recusive data-structure that represents a form's
 * internal structure */
export declare type Link<T> = {
    [P in keyof T]: T[P];
};
/** creates a link from a given datum
 * @param head The parent Form
 * @param formData The form data to create a Link from
 * @return The created recursive link */
export declare const createLink: <HEAD, T>(head: Form<HEAD>, formData: T) => any;
/** resursively subscribes a Link with the update callback
 * @param link The link to recursively subscribe
 * @param updateCallback The callback to subscribe recursively */
export declare const subscribeUpdateCallback: <HEAD, T>(link: Link<T>, updateCallback: () => void) => void;
/** Recursively traverses a link for errors
 * @param link The link to recursively traverse for errors
 * @return The retrieved errors */
export declare const recurisvelyGetErrors: <T>(link: Link<T>) => string[];
//# sourceMappingURL=Link.d.ts.map