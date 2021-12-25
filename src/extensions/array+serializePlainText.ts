import {RichText, RichTextDescendant} from '../richtext';
import {
  RichTextElement,
  RichTextElementType,
  StyledText,
} from '../richtext';
import log from '../log';

const nodes2plaintext = (nodes: RichTextDescendant[]): string =>
  nodes.reduce<string>((plain: string, node: RichTextDescendant): string => plain + node2plaintext(node), '');

const listitems2plaintext = (nodes: RichTextDescendant[]): string =>
  nodes.reduce<string>((plain: string, node: RichTextDescendant): string => `${plain}  - ${node2plaintext(node)}`, '');

const olistitems2plaintext = (nodes: RichTextDescendant[]): string =>
  nodes.reduce<string>((plain: string, node: RichTextDescendant, i): string => `${plain}  ${i + 1} ${node2plaintext(node)}`, '');

const node2plaintext = (node: RichTextDescendant | StyledText): string => {
  if (RichTextElement.isElement(node)) {
    switch (node.type) {
      case RichTextElementType.BlockQuote:
        return `\n--\n${nodes2plaintext(node.children)}\n--\n`;
      case RichTextElementType.BulletedList:
        return `\n${listitems2plaintext(node.children)}\n`;
      case RichTextElementType.HeadingOne:
        return `\n${nodes2plaintext(node.children)}\n`;
      case RichTextElementType.HeadingTwo:
        return `\n${nodes2plaintext(node.children)}\n`;
      case RichTextElementType.ListItem:
        return `${nodes2plaintext(node.children)}\n`;
      case RichTextElementType.NumberedList:
        return `\n${olistitems2plaintext(node.children)}\n`;
      case RichTextElementType.Image:
        return `${nodes2plaintext(node.children)}(${node.url})`;
      case RichTextElementType.Link:
        return `${nodes2plaintext(node.children)}(${node.url})`;
      case RichTextElementType.Paragraph:
        return `${nodes2plaintext(node.children)}\n`;
      default:
        log.error(`Unknown RichText element type = ${node.type}`, node);
        return `\n${nodes2plaintext(node.children)}\n`;
    }
  } else if (StyledText.isText(node)) {
    return node.text;
  } else {
    log.error('element2plaintext, unknown node', node);
    return '';
  }
};

if (!Array.prototype.serializePlainText) {
  // eslint-disable-next-line no-extend-native,func-names
  Array.prototype.serializePlainText = function (): string {
    return nodes2plaintext(this);
  };
}
