const reorder = <T>(items: T[], src: number, dst: number): T[] =>
  (src > dst)
    ? items
    .slice(0, dst)
    .concat(items[src])
    .concat(items.slice(dst, src))
    .concat(items.slice(src + 1))
    : (dst > src)
    ? items
      .slice(0, src)
      .concat(items.slice(src + 1, dst + 1))
      .concat(items[src])
      .concat(items.slice(dst + 1))
    : items;

export default reorder;
