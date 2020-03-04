export enum Color {
  MAROON = 'MAROON',
  BROWN = 'BROWN',
  OLIVE = 'OLIVE',
  RED = 'RED',
  ORANGE = 'ORANG',
  YELLOW = 'YELLOW',
  LIME = 'LIME',
  GREEN = 'GREEN',
  CYAN = 'CYAN',
  NAVY = 'NAVY',
  BLUE = 'BLUE',
  MAGENTA = 'MAGENTA',
  PINK = 'PINK'
}

export const rgb: Record<Color, string> = {
  [Color.BLUE]: '#4363d8',
  [Color.BROWN]: '#9A6324',
  [Color.CYAN]: '#42d4f4',
  [Color.GREEN]: '#3cb44b',
  [Color.LIME]: '#bfef45',
  [Color.MAGENTA]: '#f032e6',
  [Color.MAROON]: '#800000',
  [Color.NAVY]: '#000075',
  [Color.OLIVE]: '#808000',
  [Color.ORANGE]: '#f58231',
  [Color.PINK]: '#fabebe',
  [Color.RED]: '#e6194B',
  [Color.YELLOW]: '#ffe119',
};

export const name: Record<string, Color> = {
  '#000075': Color.NAVY,
  '#3cb44b': Color.GREEN,
  '#42d4f4': Color.CYAN,
  '#4363d8': Color.BLUE,
  '#800000': Color.MAROON,
  '#808000': Color.OLIVE,
  '#9A6324': Color.BROWN,
  '#bfef45': Color.LIME,
  '#e6194B': Color.RED,
  '#f032e6': Color.MAGENTA,
  '#f58231': Color.ORANGE,
  '#fabebe': Color.PINK,
  '#ffe119': Color.YELLOW,
};

