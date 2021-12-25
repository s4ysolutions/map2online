/* eslint-disable */
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

import {ImportedFolder, ParsingStatus} from '../index';
import {Observable, Subject} from 'rxjs';
import sax, {QualifiedTag, Tag} from 'sax';
import {Coordinate, FeaturePropsWithStyleId} from '../../catalog';
import log from '../../log';
import {degreesToMeters} from '../../lib/projection';
import {newImportedFolder} from '../new-folder';
import {hdec} from '../../lib/entities';
import {makeId} from '../../lib/id';
import {
  BaloonStyle,
  IconStyle,
  isIconStyle,
  isLineStyle,
  LabelStyle,
  LineStyle,
  ListStyle,
  Map2Styles,
  PolyStyle,
  Style,
} from '../../style';
import {makeEmptyRichText} from '../../richtext';

enum ParseState {
  NONE,
  FOLDER,
  FOLDER_NAME,
  FOLDER_DESCRIPTION,
  FOLDER_VISIBILITY,
  FOLDER_OPEN,
  PLACEMARK,
  PLACEMARK_VISIBILITY,
  PLACEMARK_NAME,
  PLACEMARK_DESCRIPTION,
  COORDINATES,
  STYLE,
  STYLE_ICON,
  STYLE_LINE,
  COLOR,
  WIDTH,
  ICON,
  HREF,
  STYLE_URL,
  EXTENDED_DATA,
  DATA,
  VALUE,
  UNKNOWN,
}

let extendedData:Record<string, string | null> = {};
const currentExtendedData = {
  name: null as string,
  value: null as string,
};

let cdata = "";

const parseTriplet = (triplet: string): Coordinate => {
  const lla = triplet.split(',').map(t => Number.parseFloat(t));
  return degreesToMeters(lla);
};

const transp = 'ffffffff';
const COLOR8_LEN = 8;
const TRANSP_LEN = 2;

export const nc = (color: string): string => {
  const c0 = color.indexOf('#') === 0 ? color.slice(1) : color;
  const l = COLOR8_LEN - c0.length;
  if (l > 0) {
    return '#' + c0 + transp.slice(0, l);
  } else if (l < 0) {
    const c1 = c0.slice(0, COLOR8_LEN);
    return `#${c1.slice(TRANSP_LEN, COLOR8_LEN)}${c1.slice(0, TRANSP_LEN)}`;
  }
  return `#${c0.slice(TRANSP_LEN, COLOR8_LEN)}${c0.slice(0, TRANSP_LEN)}`;
};

export const parseKMLCoordinates = (text: string): Coordinate[] =>
    text
        .trim()
        // .split(/\r?\n/)
        .split(/[^-0-9.,]/u)
        // .split("\n")
        .map(t => t.trim())
        .filter(t => Boolean(t))
        .map(parseTriplet);

const parseId = (node: Tag | QualifiedTag): string | null => {
  const attrs = node.attributes;
  const id = attrs && (attrs.id || attrs.ID || attrs.iD || attrs.Id);
  if (id) {
    if (typeof (id) === 'string') {
      return id;
    }
    return id.value;
  }
  return makeId();
};

const brre = /<br>/giu;
const nl = `
`;

const updateStyles = (rootFolder: ImportedFolder, styles: Record<string, Style>, defaultStyle: Style) => {
  for (const featurep of rootFolder.features) {
    const feature = featurep as FeaturePropsWithStyleId;
    if (feature.styleId == null) {
      feature.style = defaultStyle;
    } else {
      feature.style = styles[feature.styleId] || defaultStyle
    }
    delete feature.styleId
  }
  for (const folder of rootFolder.folders) {
    updateStyles(folder, styles, defaultStyle)
  }
};

export const parseKMLString = (file: File, kml: string, map2styles: Map2Styles): Promise<ImportedFolder> => {
  const rootFolder = newImportedFolder(0, null);
  rootFolder.name = file.name;

  const foldersStack: ImportedFolder[] = [rootFolder];
  const lastFolder = () => foldersStack[foldersStack.length - 1];

  const parser = sax.parser(true, {normalize: true, trim: true, xmlns: true});
  const parseStateStack: ParseState[] = [ParseState.NONE];
  const lastState = () => parseStateStack[parseStateStack.length - 1];
  let currentFeature = null as FeaturePropsWithStyleId;

  let currentStyle: Style & {id: string}= null;
  const styles: Record<string, Style> = {}; // global styles

  let currentStyleItem: BaloonStyle | IconStyle | LabelStyle | LineStyle | ListStyle | PolyStyle = null;

  return new Promise<ImportedFolder>((rs, rj) => {
    parser.onopentag = (node) => {
      const name = node.name.toUpperCase();
      log.debug('opentag', name);
      switch (name) {
        case 'DOCUMENT':
        case 'FOLDER': {
          extendedData = {};
          currentExtendedData.name = null;
          parseStateStack.push(ParseState.FOLDER);
          log.debug('parseStateStack.push(ParseState.FOLDER)', parseStateStack);
          const nextFolder = newImportedFolder(foldersStack.length, lastFolder());
          lastFolder().folders.push(nextFolder);
          foldersStack.push(nextFolder);
          break;
        }
        case 'PLACEMARK': {
          extendedData = {};
          currentExtendedData.name = null;
          parseStateStack.push(ParseState.PLACEMARK);
          log.debug('parseStateStack.push(ParseState.FEATURE)', parseStateStack);
          currentFeature = {
            styleId: makeId(),
            style: null,
            description: makeEmptyRichText(),
            geometry: null,
            id: null, // TODO: handle duplicate parseId(node),
            summary: '',
            title: '',
            visible: true,
          };
          lastFolder().features.push(currentFeature);
          break;
        }
        case 'NAME':
          if (lastState() === ParseState.FOLDER) {
            parseStateStack.push(ParseState.FOLDER_NAME);
            log.debug('parseStateStack.push(ParseState.FOLDER_NAME)', parseStateStack);
          } else if (lastState() === ParseState.PLACEMARK) {
            parseStateStack.push(ParseState.PLACEMARK_NAME);
            log.debug('parseStateStack.push(ParseState.FEATURE_NAME)', parseStateStack);
          }
          break;
        case 'DESCRIPTION':
          if (lastState() === ParseState.FOLDER) {
            parseStateStack.push(ParseState.FOLDER_DESCRIPTION);
            log.debug('parseStateStack.push(ParseState.FOLDER_DESCRIPTION)', parseStateStack);
          } else if (lastState() === ParseState.PLACEMARK) {
            parseStateStack.push(ParseState.PLACEMARK_DESCRIPTION);
            log.debug('parseStateStack.push(ParseState.FEATURE_DESCRIPTION)', parseStateStack);
          }
          break;
        case 'COORDINATES':
          parseStateStack.push(ParseState.COORDINATES);
          log.debug('parseStateStack.push(ParseState.COORDINATES)', parseStateStack);
          break;
        case 'STYLE':
          if (lastState() === ParseState.PLACEMARK) {
            currentStyle = {id: currentFeature.styleId};
            parseStateStack.push(ParseState.STYLE);
            log.debug('parseStateStack.push(ParseState.PLACEMARK_STYLE)', parseStateStack);
          } else {
            currentStyle = {id: parseId(node)};
            styles[currentStyle.id] = currentStyle;
            parseStateStack.push(ParseState.STYLE);
            log.debug('parseStateStack.push(ParseState.STYLE)', parseStateStack);
          }
          break;
        case 'ICONSTYLE':
          if (currentStyle !== null) {
            currentStyle.iconStyle = {...map2styles.defaultStyle.iconStyle}
          }
          currentStyleItem = currentStyle.iconStyle;
          parseStateStack.push(ParseState.STYLE_ICON);
          log.debug('parseStateStack.push(ParseState.STYLE_ICON)', parseStateStack);
          break;
        case 'LINESTYLE':
          if (currentStyle !== null) {
            currentStyle.lineStyle = {...map2styles.defaultStyle.lineStyle};
            currentStyleItem = currentStyle.lineStyle;
          }
          parseStateStack.push(ParseState.STYLE_LINE);
          log.debug('parseStateStack.push(ParseState.STYLE_LINE)', parseStateStack);
          break;
        case 'COLOR':
          parseStateStack.push(ParseState.COLOR);
          log.debug('parseStateStack.push(ParseState.COLOR)', parseStateStack);
          break;
        case 'WIDTH':
          parseStateStack.push(ParseState.WIDTH);
          log.debug('parseStateStack.push(ParseState.WIDTH)', parseStateStack);
          break;
        case 'ICON':
          parseStateStack.push(ParseState.ICON);
          log.debug('parseStateStack.push(ParseState.ICON)', parseStateStack);
          break;
        case 'HREF':
          parseStateStack.push(ParseState.HREF);
          log.debug('parseStateStack.push(ParseState.HREF)', parseStateStack);
          break;
        case 'STYLEURL':
          parseStateStack.push(ParseState.STYLE_URL);
          log.debug('parseStateStack.push(ParseState.STYLE_URL)', parseStateStack);
          break;
        case 'VISIBILITY':
          if (lastState() === ParseState.PLACEMARK) {
            parseStateStack.push(ParseState.PLACEMARK_VISIBILITY);
            log.debug('parseStateStack.push(ParseState.PLACEMARK_VISIBILITY)', parseStateStack);
          }else if (lastState() === ParseState.FOLDER) {
            parseStateStack.push(ParseState.FOLDER_VISIBILITY);
            log.debug('parseStateStack.push(ParseState.FOLDER_VISIBILITY)', parseStateStack);
          }
          break;
        case 'OPEN':
          if (lastState() === ParseState.FOLDER) {
            parseStateStack.push(ParseState.FOLDER_OPEN);
            log.debug('parseStateStack.push(ParseState.FOLDER_OPEN)', parseStateStack);
          }
          break;
        case 'EXTENDEDDATA':
          currentExtendedData.name = null;
          parseStateStack.push(ParseState.EXTENDED_DATA);
          extendedData = {};
          log.debug('parseStateStack.push(ParseState.EXTENDED_DATA)', parseStateStack);
          break;
        case 'DATA':
          if (lastState() === ParseState.EXTENDED_DATA) {
            currentExtendedData.name = node.attributes.name ? node.attributes.name.toString().trim() : null;
            currentExtendedData.value = null;
          }
          parseStateStack.push(ParseState.DATA);
          log.debug('parseStateStack.push(ParseState.EXTENDED_DATA_DATA)', parseStateStack);
          break;
        case 'VALUE':
          parseStateStack.push(ParseState.VALUE);
          log.debug('parseStateStack.push(ParseState.EXTENDED_DATA_DATA)', parseStateStack);
          break;
        default:
          parseStateStack.push(ParseState.UNKNOWN);
          log.debug('parseStateStack.push(ParseState.UNKNOWN)', parseStateStack, name);
      }
    };
    parser.onclosetag = (nodeName) => {
      const name = nodeName.toUpperCase();
      log.debug('closetag', name);
      switch (name) {
        case 'DOCUMENT':
        case 'FOLDER': {
          log.debug('parseStateStack.pop(ParseState.FOLDER)', parseStateStack);
          if (extendedData['RT_DESCRIPTION']) {
            lastFolder().description = extendedData['RT_DESCRIPTION'].parseToRichText();
          }
          const state = parseStateStack.pop();
          if (state === ParseState.FOLDER) {
            if (foldersStack.length === 0) {
              log.warn('No folders on the stack');
            }
            log.debug('parseStateStack.pop(ParseState.FOLDER) 2', parseStateStack);
            foldersStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, state);
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        }
        case 'NAME':
          if (lastState() === ParseState.FOLDER_NAME || lastState() === ParseState.PLACEMARK_NAME) {
            log.debug('parseStateStack.pop(ParseState.FOLDER_NAME || FEATUTE_NAME)', parseStateStack);
            parseStateStack.pop();
          } else {
            if (lastState() !== ParseState.UNKNOWN) {
              log.warn(`${nodeName} tag does not match`, lastState());
              rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
            }
          }
          break;
        case 'DESCRIPTION':
          if (lastState() === ParseState.FOLDER_DESCRIPTION || lastState() === ParseState.PLACEMARK_DESCRIPTION) {
            log.debug('parseStateStack.pop(ParseState.FOLDER_DESCRIPTION || FEATUTE_DESCRIPTION)', parseStateStack);
            parseStateStack.pop();
          } else {
            if (lastState() !== ParseState.UNKNOWN) {
              log.warn(`${nodeName} tag does not match`, lastState());
              rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
            }
          }
          break;
        case 'COORDINATES':
          if (lastState() === ParseState.COORDINATES) {
            log.debug('parseStateStack.pop(ParseState.COORDINATES)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'PLACEMARK':
          if (lastState() === ParseState.PLACEMARK) {
            log.debug('parseStateStack.pop(ParseState.FEATURE)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'STYLE':
          if (lastState() === ParseState.STYLE) {
            currentStyle = null;
            log.debug('parseStateStack.pop(ParseState.STYLE)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'ICONSTYLE':
          currentStyleItem = null;
          if (lastState() === ParseState.STYLE_ICON) {
            log.debug('parseStateStack.pop(ParseState.STYLE_ICON)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'LINESTYLE':
          currentStyleItem = null;
          if (lastState() === ParseState.STYLE_LINE) {
            log.debug('parseStateStack.pop(ParseState.STYLE_LINE)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'COLOR':
          if (lastState() === ParseState.COLOR) {
            log.debug('parseStateStack.pop(ParseState.COLOR)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'WIDTH':
          if (lastState() === ParseState.WIDTH) {
            log.debug('parseStateStack.pop(ParseState.WIDTH)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'ICON':
          if (lastState() === ParseState.ICON) {
            log.debug('parseStateStack.pop(ParseState.ICON)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'HREF':
          if (lastState() === ParseState.HREF) {
            log.debug('parseStateStack.pop(ParseState.HREF)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'STYLEURL':
          if (lastState() === ParseState.STYLE_URL) {
            log.debug('parseStateStack.pop(ParseState.STYLE_URL)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'VISIBILITY':
          if (lastState() === ParseState.PLACEMARK_VISIBILITY || lastState() === ParseState.FOLDER_VISIBILITY) {
            log.debug('parseStateStack.pop(ParseState.*_VISIBILITY)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'OPEN':
          if (lastState() === ParseState.FOLDER_OPEN) {
            log.debug('parseStateStack.pop(ParseState.*_OPEN)', parseStateStack);
            parseStateStack.pop();
          } else {
            if (lastState() === ParseState.UNKNOWN) {
              log.warn(`${nodeName} tag does not match`, lastState());
              rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
            }
          }
          break;
        case 'EXTENDEDDATA':
          if (lastState() === ParseState.EXTENDED_DATA) {
            log.debug('parseStateStack.pop(ParseState.EXTENDED_DATA)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'DATA':
          if (lastState() === ParseState.DATA) {
            log.debug('parseStateStack.pop(ParseState.DATA)', parseStateStack);
            parseStateStack.pop();
            if (currentExtendedData.name) {
              extendedData[currentExtendedData.name.toUpperCase()] = currentExtendedData.value;
            }
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'VALUE':
          if (lastState() === ParseState.VALUE) {
            log.debug('parseStateStack.pop(ParseState.VALUE)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        default:
          if (lastState() === ParseState.UNKNOWN) {
            log.debug('parseStateStack.pop(ParseState.UNKNOWN)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
      }
    };
    parser.ontext = (textWithEntities) => {
      const text = hdec(textWithEntities);
      log.debug('text', text);
      switch (lastState()) {
        case ParseState.FOLDER_NAME:
          lastFolder().name = text.trim();
          break;
        case ParseState.FOLDER_DESCRIPTION:
          lastFolder().description = text.trim().convertToRichText();
          break;
        case ParseState.FOLDER_OPEN:
          lastFolder().open = text.trim().toUpperCase() != 'FALSE';
          break;
        case ParseState.FOLDER_VISIBILITY:
          lastFolder().visible = text.trim().toUpperCase() != 'FALSE';
          break;
        case ParseState.PLACEMARK_NAME:
          currentFeature.title = text.trim();
          break;
        case ParseState.VALUE:
          currentExtendedData.value = text.trim();
          break;
        case ParseState.PLACEMARK_DESCRIPTION:
          currentFeature.description = text.trim().convertToRichText();
          break;
        case ParseState.PLACEMARK_VISIBILITY:
          currentFeature.visible = text.trim().toUpperCase() != 'FALSE';
          break;
        case ParseState.COORDINATES: {
          const coordinates = parseKMLCoordinates(text.trim());
          if (coordinates.length === 1) {
            currentFeature.geometry = {
              coordinate: coordinates[0],
            };
          } else {
            currentFeature.geometry = {
              coordinates,
            };
          }
          break;
        }
        case ParseState.COLOR: {
          if (isLineStyle(currentStyleItem) || isIconStyle(currentStyleItem)) {
            currentStyleItem.color = nc(text.trim())
          }
          break;
        }
        case ParseState.HREF: {
          console.log('href', text);
          if (isIconStyle(currentStyleItem)) {
            currentStyleItem.icon = new URL(text.trim())
          }
          break;
        }
        case ParseState.STYLE_URL: {
          if (currentFeature) {
            const urlhash = text.trim();
            currentFeature.styleId = urlhash.length > 0 && urlhash[0] === '#' ? urlhash.slice(1) : urlhash;
          }
          break;
        }
        case ParseState.WIDTH: {
          if (isLineStyle(currentStyleItem)) {
            const w = Number(text.trim());
            if (!isNaN(w)) {
              currentStyleItem.width = w;
            }
          }
          break;
        }
      }
    };

    parser.onopencdata = () => {
      cdata = "";
    };

    parser.oncdata = (text) => {
      cdata += text;
    };

    parser.onclosecdata = () => {
      switch (lastState()) {
        case ParseState.HREF:
          if (isIconStyle(currentStyleItem)) {
            currentStyleItem.icon = new URL(cdata.trim())
          }
          break;
        case ParseState.FOLDER_NAME:
          lastFolder().name = cdata.trim();
          break;
        case ParseState.FOLDER_DESCRIPTION:
          lastFolder().description = cdata.trim().convertToRichText();
          break;
        case ParseState.PLACEMARK_NAME:
          currentFeature.title = cdata.trim();
          break;
        case ParseState.PLACEMARK_DESCRIPTION:
          currentFeature.description = cdata.trim().convertToRichText();
          break;
      }
    };

    parser.onend = () => {
      log.debug('end');
      log.debug('resolve');

      const normilizedStyles: Record<string, Style> = Object.entries(styles).reduce((acc, [styleId, style]) => {
        const map2style = map2styles.findEq(style);
        return {...acc, [styleId]: map2style || style}
      }, {});

      updateStyles(rootFolder, normilizedStyles, map2styles.defaultStyle);
      rs(rootFolder);
    };
    parser.onerror = (e) => {
      log.debug('error');
      log.debug('reject');
      rj(e);
    };
    parser.write(kml.replace(brre, nl));
    log.debug('close');
    parser.close();
  });
};

const parseKMLFile = (kml: File, map2styles: Map2Styles): Promise<ImportedFolder> => {
  const reader = new FileReader();
  return new Promise<string>((rs) => {
    reader.onload = e => rs(e.target.result as string);
    reader.readAsText(kml);
  }).then(content => parseKMLString(kml, content, map2styles));
};

export const kmlParserFactory = (map2styles: Map2Styles): {
    parse: (fileList: FileList) => Promise<ImportedFolder>,
    status: ParsingStatus,
    statusObservable: () => Observable<ParsingStatus>,
  } => {
    const subject = new Subject<ParsingStatus>();

    const status: ParsingStatus = {
      rootFolder: newImportedFolder(0, null),
      parsingFile: null as File,
      queuedFiles: [] as File[],
    };

    let parsedFilesCount = 0;
    const parseQueuedFiles = (promises: Promise<ImportedFolder>[]): Promise<ImportedFolder>[] => {

      if (status.queuedFiles.length === 0) {
        return promises; // .concat([Promise.resolve(status.rootFolder)]);
      }

      const [current, ...nextFiles] = status.queuedFiles;
      status.parsingFile = current;
      status.queuedFiles = nextFiles;

      subject.next({...status});

      const promiseParsed: Promise<ImportedFolder> = parseKMLFile(status.parsingFile, map2styles).then((importedFolder: ImportedFolder) => {
        if (parsedFilesCount++ === 0) {
          // eslint-disable-next-line require-atomic-updates
          status.rootFolder = importedFolder;
        } else {
          if (parsedFilesCount++ === 1) {
            // eslint-disable-next-line require-atomic-updates
            status.rootFolder.folders = [status.rootFolder];
          }
          status.rootFolder.folders.push(importedFolder);
        }
        // eslint-disable-next-line require-atomic-updates
        status.parsingFile = null;

        subject.next({...status});
        return importedFolder;
      });
      return parseQueuedFiles(promises.concat(promiseParsed));
    };

    return {
      parse(fileList: FileList): Promise<ImportedFolder> {
        status.rootFolder = newImportedFolder(0, null);
        status.parsingFile = null;
        status.queuedFiles = [];
        parsedFilesCount = 0;
        for (let i = 0; i < fileList.length; i++) {
          status.queuedFiles.push(fileList[i]);
        }
        subject.next({...status});
        return Promise.all(parseQueuedFiles([])).then(() => status.rootFolder);
      },
      get status() {
        return status;
      },
      statusObservable: () => subject,
    };
  }
;
