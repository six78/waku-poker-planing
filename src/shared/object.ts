export function toDictionary<T extends object>(
  data: T[],
  groupBy: keyof T,
  removeGroupBy: boolean = true
): { [key: string]: Omit<T, keyof T> | T } {
  const result: { [key: string]: Omit<T, keyof T> | T } = {};

  data.forEach(x => {
    const key = x[groupBy];
    if (typeof key === 'string' || typeof key === 'number') {
      if (removeGroupBy) {
        const { [groupBy]: _, ...rest } = x;
        result[key.toString()] = rest;
      } else {
        result[key.toString()] = x;
      }
    }
  });

  return result;
}

export function toArray<T>(data: Record<string, T>): (T & { __key: string })[] {
  return Object.keys(data).map(x => ({
    ...data[x],
    __key: x
  }));
}