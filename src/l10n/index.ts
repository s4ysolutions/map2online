/*
 * Copyright 2019 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

let locale = 'en';
export const currentLocale = (): string => locale;

type Dictionary = { [key: string]: string }

let messages: Dictionary = {};
let dictionary: { [key: string]: Dictionary } = {};

const translate = (key: string): string => messages[key] ? messages[key] : key;

const init = (lc: string, dict: { [key: string]: Dictionary }) => {
  const lcs: string[] = lc.split('-');
  const [mainlocale] = lcs;
  locale = lcs[1] ? `${lcs[0]}-${lcs[1].toUpperCase()}` : lc;

  const locales: string[] = Object.keys(dict);
  if (locales.length > 0) {
    // default messages
    messages = {...dict[locales[0]]};
    if (mainlocale !== locale) {
      // add messages from first part of locale
      if (dict[mainlocale]) {
        messages = {
          ...messages,
          ...dict[mainlocale],
        };
      }
    }
    if (dict[locale]) {
      // add minor locale translations
      messages = {
        ...messages,
        ...dict[locale],
      };
    }
  }

  // set final version of dictionalry
  dictionary = dict;
  dictionary[lc] = messages;
};

const l10n = (strings: TemplateStringsArray, ...values: string[]): string => {
  const r = strings.reduce((prevString: string, nextString: string, index: number) => prevString + (index > 0 ? values[index - 1] : '') + nextString, '');
  return translate(r);
};

export default l10n;

export const byLang = (lc: string, key: string): string => dictionary[lc][key] ? dictionary[lc][key] : `L10N:${key}[${lc}]:L10N`;

import translations from './translations';

// init(typeof navigator !== 'undefined' && navigator.language || 'en', translations);

init('ru', translations);
