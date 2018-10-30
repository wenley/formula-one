# Changelog

### v0.5.0

- Expose a `submit(extraData)` method on `<Form>` to submit forms from a ref.

### v0.4.0

- Implement all of the feedback strategies.

### v0.3.1

- Unbreak a test.

### v0.3.0

- Add a way to pass additional information to `onSubmit` as a second argument.
- Add `onChange` prop to `<Form>`. Make `onChange` and `onSubmit` optional, since they probably won't co-occur.
- Add additional information to render functions for `<Form>` and `Field`s as a third argument.

### v0.2.1

- Reworked how server errors are updated. Fixes a bug where an exception would be thrown if the tree shapes didn't match. This could happen if you have a field which creates an object or array, which are not translated to leaf nodes internally.
- Added CHANGELOG
