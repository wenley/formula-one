# Changelog

### v0.9.0-alpha

- Add `customChange` prop to `ObjectField` and `ArrayField`. This allows changes in one part of the object to affect other parts of the form. Currently, no metadata is preserved (all fields are marked **changed** and **touched**) if a `customChange` function is used. This will be addressed in a future API.

  **Warning**: Rendering a component which calls `onChange` during mount under a non-null returning `customChange` will result in an infinite render loop.

  **Warning**: returning non-null from `customChange` forces a remount of all children. This can cause unintended consequences such as loss of focus on inputs. This will be fixed in a future 0.9 release.

- Add `addFields` and `filterFields` array manipulators. These are currently necessary due to the non-atomic nature of the current `addField` and `removeField` manipulators. They will be made atomic in a future version.

  The API is:

  ```jsx
  // A type indicating a range to be inserted at an index
  type Span<E> = [number, $ReadOnlyArray<E>];

  // A way to atomicly add fields to an ArrayField<E>
  addFields: (spans: $ReadOnlyArray<Span<E>) => void;

  // A way to remove fields from an ArrayField<E>
  filterFields: (predicate: (item: E, index: number) => boolean) => void
  ```

- Fix flow types for ErrorHelper.

### v0.8.2

- Fix incorrect export caused by OS X case insensitivity

### v0.8.1

- Fix bad path in /dist caused by OS X case insensitivity

### v0.8.0

- Add `onValidation` prop to `Form`. This is a callback which will be called any time validations occur within the form. It receives a boolean, which is whether the form is valid according to the formula-one validations.

### v0.7.0

- Fix the types of the links produced by all `Field`s. This breakage occurred because `React.ElementConfig` is broken for components with a type parameter.
- Add type tests to ensure the types stay working.

### v0.6.4

- Update Flow types to work with Flow 0.86.0.

### v0.6.3

- Fix another feedbackStrategy import issue. Also, yarn ignores .npmignore files when packing for publish, so that's broken too: https://github.com/yarnpkg/yarn/issues/685

### v0.6.2

- Remove tests from the npm package. This will prevent flow from trying to check the test files and also makes the package smaller.

### v0.6.1

- Export FeedbackStrategies under the right name.

### v0.6.0

- Rework the `feedbackStrategy` prop. Several primitive strategies and algebraic combinators are exported under `FeedbackStrategies`, a new top-level export. See the documentation for more info.

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
