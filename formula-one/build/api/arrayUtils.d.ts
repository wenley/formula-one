declare type addField = () => void;
declare type removeField = (index: number) => void;
/**
 * Provides utils for working with arrays in forms
 * @param Link The array link to provide utils for
 * @param defaultVal The default value that will be used when adding
 * a field to the Link */
declare const arrayUtils: <T>(link: any, defaultVal: T) => [addField, removeField];
export default arrayUtils;
//# sourceMappingURL=arrayUtils.d.ts.map