export type TypeListObject = {
  [key: string]:
    | "undefined"
    | "object"
    | "boolean"
    | "number"
    | "bigint"
    | "string"
    | "symbol"
    | "function";
};

export function checkObject<T>(
  // deno-lint-ignore no-explicit-any
  actual: any,
  types: TypeListObject,
): actual is T {
  const actualKeysJSON = JSON.stringify(Object.keys(actual).sort());
  const exceptedKeysJSON = JSON.stringify(Object.keys(types).sort());

  if (actualKeysJSON !== exceptedKeysJSON) return false;

  let isSuccessCheck = true;

  Object.keys(actual).forEach((key) => {
    if (!isSuccessCheck) return;

    const type = types[key];
    const actualValue = actual[key];
    // deno-lint-ignore valid-typeof
    isSuccessCheck = typeof actualValue === type;
  });

  return isSuccessCheck;
}
