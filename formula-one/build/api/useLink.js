"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const MetaLink_1 = require("../datastructures/MetaLink");
const Link_1 = require("../datastructures/Link");
/** retrieves the link content associated with a given Link
 * @param link The link to retrieve the link from
 * @param validator The validator function to be used on the value
 * @return The content of the link */
const useLink = (link, validator) => {
    const metaLink = link[MetaLink_1.linkSymbol];
    metaLink.updateValidator(validator);
    return {
        id: metaLink.id,
        value: metaLink.valueRef.getValue(),
        errors: metaLink.errors,
        onChange: (newValue) => { metaLink.onChange(newValue); },
        onBlur: metaLink.onBlur,
        childErrors: () => Link_1.recurisvelyGetErrors(link),
    };
};
exports.default = useLink;
//# sourceMappingURL=useLink.js.map