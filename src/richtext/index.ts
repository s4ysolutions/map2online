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
}

export const RichTextElement: RichTextElementInterface = {
  isElement: (value: unknown): value is RichTextElement => (value as RichTextElement).children !== undefined && (value as RichTextElement).type !== undefined,
};


export type RichText = RichTextDescendant[];

export interface RichTextInterface {
  stringify: () => string;
}

export const RichText: RichTextInterface = {
  stringify () {
    return JSON.stringify(this);
  },
};

export const makeEmptyRichText: () => RichText = () => [
  {
    type: RichTextElementType.Paragraph,
    children: [{text: ''}],
  },
];
