export type StyledText = {
  bold?: boolean
  italic?: boolean
  code?: boolean
  underline?: boolean
  text: string
}

export interface StyledTextInterface {
  isText: (value: unknown) => value is StyledText;
}

export const StyledText: StyledTextInterface = {
  isText: (value: unknown): value is StyledText => (value as StyledText).text !== undefined,
};

export enum RichTextElementType {
  BlockQuote = 'block-quote',
  BulletedList = 'bulleted-list',
  HeadingOne = 'heading-one',
  EditableVoid = 'editable-void',
  HeadingTwo = 'heading-two',
  Image = 'image',
  Link = 'link',
  ListItem = 'list-item',
  NumberedList = 'numbered-list',
  Paragraph = 'paragraph',
}


export type RichTextDescendant = RichTextElement | StyledText

export type BlockQuoteElement = { type: RichTextElementType.BlockQuote; children: RichTextDescendant[] }
export type BulletedListElement = { type: RichTextElementType.BulletedList; children: RichTextDescendant[] }
export type HeadingOneElement = { type: RichTextElementType.HeadingOne; children: RichTextDescendant[] }
export type EditableVoidElement = { type: RichTextElementType.EditableVoid; children: RichTextDescendant[] }
export type HeadingTwoElement = { type: RichTextElementType.HeadingTwo; children: RichTextDescendant[] }
export type ImageElement = { type: RichTextElementType.Image; url: string; children: RichTextDescendant[] }
export type LinkElement = { type: RichTextElementType.Link; url: string; children: RichTextDescendant[] }
export type ListItemElement = { type: RichTextElementType.ListItem; url: string; children: RichTextDescendant[] }
export type NumberedListElement = { type: RichTextElementType.NumberedList; children: RichTextDescendant[] }
export type ParagraphElement = { type: RichTextElementType.Paragraph; children: RichTextDescendant[] }

export type RichTextElement =
  | BlockQuoteElement
  | BulletedListElement
  | EditableVoidElement
  | HeadingOneElement
  | HeadingTwoElement
  | ImageElement
  | LinkElement
  | ListItemElement
  | NumberedListElement
  | ParagraphElement

export interface RichTextElementInterface {
  isElement: (value: unknown) => value is RichTextElement;
  isStyledText: (value: unknown) => value is StyledText;
}

export const RichTextElement: RichTextElementInterface = {
  isElement: (value: unknown): value is RichTextElement =>
    (value as RichTextElement).children !== undefined &&
    (value as RichTextElement).type !== undefined,
  isStyledText: (value: unknown): value is StyledText =>
    (value as StyledText).text !== undefined &&
    (value as RichTextElement).children === undefined &&
    (value as RichTextElement).type === undefined,
};


export type RichText = RichTextDescendant[];

export interface RichTextInterface {
  stringify: () => string;
  isEmpty: (richText: RichText) => boolean;
  makeEmpty: () => RichText;
}

export const RichText: RichTextInterface = {
  stringify() {
    return JSON.stringify(this);
  },
  isEmpty(richText: RichText): boolean {
    if (richText.length > 1) {
      return false;
    }
    if (richText.length === 1) {
      const element = richText[0];
      if (RichTextElement.isElement(element)) {
        return RichText.isEmpty(element.children);
      } else if (RichTextElement.isStyledText(element)) {
        if (element.text.trim().length === 0) {
          return true;
        }
      }
    }
    return false;
  },
  makeEmpty(): RichText {
    return [
      {
        type: RichTextElementType.Paragraph,
        children: [{text: ''}],
      },
    ];
  },
};
