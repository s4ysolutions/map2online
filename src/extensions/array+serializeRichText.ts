if (!Array.prototype.serializeRichText) {
  // eslint-disable-next-line no-extend-native,func-names
  Array.prototype.serializeRichText = function (): string {
    return JSON.stringify(this);
  };
}
