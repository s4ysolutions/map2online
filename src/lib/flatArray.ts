const flatArray = <T>(arr: T[][]): T[] => [].concat([...arr]);
export default flatArray;
