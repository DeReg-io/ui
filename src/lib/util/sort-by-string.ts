// only supports 2 multikeys, i.e. 'a.b'
export function sortBy(
  collection: any[],
  key: string,
  sort: 'asc' | 'desc',
  nullsLast = false
) {
  const multiKey = key.split('.');
  if (multiKey.length > 1) {
    return collection.sort((a, b) => {
      if (nullsLast) {
        if (a[multiKey[0]][multiKey[1]] === null) return 1;
        if (b[multiKey[0]][multiKey[1]] === null) return -1;
      }
      if (a[multiKey[0]][multiKey[1]] === b[multiKey[0]][multiKey[1]]) return 0;
      if (sort === 'asc') {
        if (a[multiKey[0]][multiKey[1]] === null) return 1;
        return a[multiKey[0]][multiKey[1]] > b[multiKey[0]][multiKey[1]]
          ? 1
          : -1;
      } else {
        if (b[multiKey[0]][multiKey[1]] === null) return 1;
        return a[multiKey[0]][multiKey[1]] < b[multiKey[0]][multiKey[1]]
          ? 1
          : -1;
      }
    });
  } else {
    return collection.sort((a, b) => {
      if (nullsLast) {
        if (a[key] === null) return 1;
        if (b[key] === null) return -1;
      }
      if (a[key] === b[key]) return 0;
      if (sort === 'asc') {
        if (a[key] === null) return 1;
        return a[key] > b[key] ? 1 : -1;
      } else {
        if (b[key] === null) return 1;
        return a[key] < b[key] ? 1 : -1;
      }
    });
  }
}
