/**
 * @description
 * useLink is used by data entry components to explode a link
 * down to its respective components
 *
 * @example
 * const TextInput = (link) => {
 *   {value, onChange, onBlur, errors} = useLink(link);
 *
 *   return (
 *     <Container>
 *       <input type="text" value={value} onChange={onChange} onBlur={onBlur} />
 *       <p> {errors.join('')} </p>
 *     </Container>
 *   );
 * }
 */
import { Validator } from '../datastructures/MetaLink';
import { Link } from '../datastructures/Link';
export declare type LinkContents<T> = {
    id: number;
    value: T;
    errors: string[];
    onChange: (newValue: T) => void;
    onBlur: (newValue: T) => void;
    childErrors: () => string[];
};
/** retrieves the link content associated with a given Link
 * @param link The link to retrieve the link from
 * @param validator The validator function to be used on the value
 * @return The content of the link */
declare const useLink: <T>(link: Link<T>, validator?: Validator<T> | undefined) => LinkContents<T>;
export default useLink;
//# sourceMappingURL=useLink.d.ts.map