/* eslint-disable no-magic-numbers */
import {expect} from 'chai';
import {RichText} from '../../../src/richtext';
import '../../../src/extensions/array+serializeRichText';
import '../../../src/extensions/array+serializePlainText';
import '../../../src/extensions/string+richtext';
import {RichTextElementType} from '../../../src/richtext';

describe('Test richtext', () => {
  it('array is ok', () => {
    const a = [1, 2, 3, 4];
    // eslint-disable-next-line guard-for-in
    for (const ia in a) {
      const va = a[ia];
      expect(va).to.be.eq(a[ia]);
    }
  });
  it('serializeRichText', () => {
    const t = 'aaa'.convertToRichText();
    const serialized = t.serializeRichText();
    expect(serialized).to.be.eq('[{"type":"paragraph","children":[{"text":"aaa"}]}]');
  });
  it('serializePlainText', () => {
    const t: RichText = [
      {
        type: RichTextElementType.Paragraph,
        children: [{text: 'aaa'}, {text: 'bbb', bold: true}],
      },
      {
        type: RichTextElementType.Paragraph,
        children: [{text: 'ccc'}, {text: 'ddd', bold: true}],
      },
    ];
    const serialized = t.serializePlainText();
    expect(serialized).to.be.eq('aaabbb\ncccddd\n');
  });
  it('serializePlainText link', () => {
    const t: RichText = [
      {
        type: RichTextElementType.Paragraph,
        children: [{type: RichTextElementType.Link, url: 'zzz', children: [{text: 'eee'}, {text: 'fff', bold: true}]}],
      },
    ];
    const serialized = t.serializePlainText();
    expect(serialized).to.be.eq('eeefff(zzz)\n');
  });
});

