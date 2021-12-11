const re = /\{(?<number>\d+)\}/gu;

if (!String.prototype.format) {
  // eslint-disable-next-line no-extend-native,func-names
  String.prototype.format = function (this: string, ...args): string {
    return this.replace(
      re,
      (match, number) => typeof args[number - 1] === 'undefined' ? match : args[number - 1],
    );
  };
}
