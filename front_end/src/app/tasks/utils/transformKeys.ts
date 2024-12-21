type KeyTransformer<T> = T extends object
  ? T extends Array<infer U>
    ? Array<KeyTransformer<U>>
    : {
        [K in keyof T as K extends string ? FormatKey<K> : K]: KeyTransformer<
          T[K]
        >;
      }
  : T;

type FormatKey<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<FormatKey<U>>}`
  : S;

export function transformKeys<T>(objectOrArray: T): KeyTransformer<T> {
  if (typeof objectOrArray !== "object" || objectOrArray === null)
    return objectOrArray as KeyTransformer<T>;

  if (Array.isArray(objectOrArray)) {
    return objectOrArray.map(transformKeys) as KeyTransformer<T>;
  }

  let transformedObject: any = {};

  for (const key in objectOrArray) {
    const formattedKey = formatKeyToCamel(key);
    transformedObject[formattedKey] = transformKeys(objectOrArray[key]);
  }
  return transformedObject;
}

function formatKeyToCamel(str: string) {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );
}
