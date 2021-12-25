import {RichText, RichTextElementType} from '../richtext';

if (!String.prototype.parseToRichText) {
  // eslint-disable-next-line no-extend-native,func-names
  String.prototype.parseToRichText = function (): RichText {
    return JSON.parse(this);
  };
}

if (!String.prototype.convertToRichText) {
  // eslint-disable-next-line no-extend-native,func-names
  String.prototype.convertToRichText = function (): RichText {
    return this.split(/\r?\n/u).map((para: string) => ({
      type: RichTextElementType.Paragraph,
      children: [{text: para}],
    }));
  };
}
