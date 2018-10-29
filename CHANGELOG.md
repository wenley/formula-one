# Changelog

### master

- Add additional information to render functions for `<Form>` and `Field`s as a third argument.

### v0.2.1

- Reworked how server errors are updated. Fixes a bug where an exception would be thrown if the tree shapes didn't match. This could happen if you have a field which creates an object or array, which are not translated to leaf nodes internally.
- Added CHANGELOG
