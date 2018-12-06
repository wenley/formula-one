// @flow strict

export function removeAt<E>(index: number, arr: $ReadOnlyArray<E>): Array<E> {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

export function replaceAt<E>(
  index: number,
  item: E,
  arr: $ReadOnlyArray<E>
): Array<E> {
  return [...arr.slice(0, index), item, ...arr.slice(index + 1)];
}

export function insertAt<E>(
  index: number,
  item: E,
  arr: $ReadOnlyArray<E>
): Array<E> {
  return [...arr.slice(0, index), item, ...arr.slice(index)];
}

export function moveFromTo<E>(
  oldIndex: number,
  newIndex: number,
  arr: $ReadOnlyArray<E>
): Array<E> {
  const without = removeAt(oldIndex, arr);
  return insertAt(newIndex, arr[oldIndex], without);
}

export function insertSpans<E>(
  spans: $ReadOnlyArray<[number, $ReadOnlyArray<E>]>,
  arr: $ReadOnlyArray<E>
): Array<E> {
  // no duplicated indices are allowed, ECMAScript Array.sort is not stable by spec
  const indexSet = new Set(spans.map(([i]) => i));
  if (indexSet.size !== spans.length) {
    throw new Error(
      "You cannot insert two spans at the same index. Combine the values of the spans."
    );
  }

  // sort spans by insertion position
  const spansCopy = [...spans];
  spansCopy.sort(([i], [j]) => i - j);

  // build the new array in one pass
  let ret = [];
  let lastIndexInsertedAt = 0;
  spansCopy.forEach(([index, contents]) => {
    // All the content before this
    ret = ret.concat(arr.slice(lastIndexInsertedAt, index));
    ret = ret.concat(contents);
    lastIndexInsertedAt = index;
  });
  ret = ret.concat(arr.slice(lastIndexInsertedAt));

  return ret;
}

// Strict on length
export function zipWith<A, B, C>(
  f: (A, B) => C,
  left: $ReadOnlyArray<A>,
  right: $ReadOnlyArray<B>
): Array<C> {
  if (left.length !== right.length) {
    throw new Error("Tried to zip two lists of unequal length");
  }
  const ret = [];
  for (let i = 0; i < left.length; i += 1) {
    ret.push(f(left[i], right[i]));
  }
  return ret;
}

export function zip<A, B>(
  left: $ReadOnlyArray<A>,
  right: $ReadOnlyArray<B>
): Array<[A, B]> {
  return zipWith((l, r) => [l, r], left, right);
}

export function unzip<A, B>(
  zipped: $ReadOnlyArray<[A, B]>
): [Array<A>, Array<B>] {
  const ret = [[], []];
  for (let i = 0; i < zipped.length; i += 1) {
    const [left, right] = zipped[i];
    ret[0].push(left);
    ret[1].push(right);
  }
  return ret;
}
