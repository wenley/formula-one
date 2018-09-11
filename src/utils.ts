export function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

// tslint:disable-next-line no-empty
export function noop(...args: object[]) {}

// quick and dirty promise check
// tslint:disable-next-line no-any
export function isPromise(obj: any) {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}
