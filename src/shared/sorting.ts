export enum Sort {
  Asc = 'ASC',
  Desc = 'DESC'
}

type SortableProperty<T> = {
  [K in keyof T]: T[K] extends number ? K : never
}[keyof T];

export function getSortFn<T extends object>(
  groupBy: SortableProperty<T>,
  sort: Sort
): (a: T, b: T) => number {
  return (a: T, b: T) => {
    const valueA = a[groupBy];
    const valueB = b[groupBy];

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sort === Sort.Asc ? valueA - valueB : valueB - valueA;
    }

    return 0;
  }
}