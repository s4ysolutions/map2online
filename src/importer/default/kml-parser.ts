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
import sax from 'sax';
import {Coordinate, FeatureProps} from '../../catalog';
import log from '../../log';
import {Color} from '../../lib/colors';
import {degreesToMeters} from '../../lib/projection';
import {newImportedFolder} from '../new-folder';
import {hdec} from '../../lib/entities';

enum ParseState {
  NONE,
  FOLDER,
  FOLDER_NAME,
  FOLDER_DESCRIPTION,
  FEATURE,
  FEATURE_NAME,
  FEATURE_DESCRIPTION,
  COORDINATES,
  UNKNOWN,
}

const parseTriplet = (triplet: string): Coordinate => {
  const lla = triplet.split(',').map(t => Number.parseFloat(t));
  return degreesToMeters(lla);
};

const parseCoordinates = (text: string): Coordinate[] =>
  text
    .trim()
    // .split(/\r?\n/)
    .split(/[^0-9.,]/u)
    // .split("\n")
    .map(t => t.trim())
    .filter(t => Boolean(t))
    .map(parseTriplet);


const brre = /<br>/giu;
const nl = `
`;

export const parseKMLString = (file: File, kml: string): Promise<ImportedFolder> => {
  const rootFolder = newImportedFolder(0, null);
  rootFolder.name = file.name;

  const foldersStack: ImportedFolder[] = [rootFolder];
  const lastFolder = () => foldersStack[foldersStack.length - 1];

  const parser = sax.parser(true, {normalize: true, trim: true, xmlns: true});
  const parseStateStack: ParseState[] = [ParseState.NONE];
  const lastState = () => parseStateStack[parseStateStack.length - 1];
  let currentFeature = null as FeatureProps;

  return new Promise<ImportedFolder>((rs, rj) => {
    parser.onopentag = (node) => {
      const name = node.name.toUpperCase();
      log.debug('opentag', name);
      switch (name) {
        case 'DOCUMENT':
        case 'FOLDER': {
          parseStateStack.push(ParseState.FOLDER);
          log.debug('parseStateStack.push(ParseState.FOLDER)', parseStateStack);
          const nextFolder = newImportedFolder(foldersStack.length, lastFolder());
          lastFolder().folders.push(nextFolder);
          foldersStack.push(nextFolder);
          break;
        }
        case 'PLACEMARK': {
          parseStateStack.push(ParseState.FEATURE);
          log.debug('parseStateStack.push(ParseState.FEATURE)', parseStateStack);
          currentFeature = {
            color: Color.RED,
            description: '',
            geometry: null,
            id: null,
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
          } else if (lastState() === ParseState.FEATURE) {
            parseStateStack.push(ParseState.FEATURE_NAME);
            log.debug('parseStateStack.push(ParseState.FEATURE_NAME)', parseStateStack);
          }
          break;
        case 'DESCRIPTION':
          if (lastState() === ParseState.FOLDER) {
            parseStateStack.push(ParseState.FOLDER_DESCRIPTION);
            log.debug('parseStateStack.push(ParseState.FOLDER_DESCRIPTION)', parseStateStack);
          } else if (lastState() === ParseState.FEATURE) {
            parseStateStack.push(ParseState.FEATURE_DESCRIPTION);
            log.debug('parseStateStack.push(ParseState.FEATURE_DESCRIPTION)', parseStateStack);
          }
          break;
        case 'COORDINATES':
          parseStateStack.push(ParseState.COORDINATES);
          log.debug('parseStateStack.push(ParseState.COORDINATES)', parseStateStack);
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
          if (lastState() === ParseState.FOLDER_NAME || lastState() === ParseState.FEATURE_NAME) {
            log.debug('parseStateStack.pop(ParseState.FOLDER_NAME || FEATUTE_NAME)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
          }
          break;
        case 'DESCRIPTION':
          if (lastState() === ParseState.FOLDER_DESCRIPTION || lastState() === ParseState.FEATURE_DESCRIPTION) {
            log.debug('parseStateStack.pop(ParseState.FOLDER_DESCRIPTION || FEATUTE_DESCRIPTION)', parseStateStack);
            parseStateStack.pop();
          } else {
            log.warn(`${nodeName} tag does not match`, lastState());
            rj(Error(`${nodeName} tag does not match, lasts state=${lastState()}`));
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
          if (lastState() === ParseState.FEATURE) {
            log.debug('parseStateStack.pop(ParseState.FEATURE)', parseStateStack);
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
        case ParseState.FEATURE_NAME:
          currentFeature.title = text.trim();
          break;
        case ParseState.FOLDER_DESCRIPTION:
          lastFolder().description = text.trim();
          break;
        case ParseState.FEATURE_DESCRIPTION:
          currentFeature.description = text.trim();
          break;
        case ParseState.COORDINATES: {
          const coordinates = parseCoordinates(text.trim());
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
      }
    };
    parser.onend = () => {
      log.debug('end');
      log.debug('resolve');
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

const parseKMLFile = (kml: File): Promise<ImportedFolder> => {
  const reader = new FileReader();
  return new Promise<string>((rs) => {
    reader.onload = e => rs(e.target.result as string);
    reader.readAsText(kml);
  }).then(content => parseKMLString(kml, content));
};

export const kmlParserFactory = (): {
  parse: (fileList: FileList) => Promise<ImportedFolder>;
  status: ParsingStatus;
  statusObservable: () => Observable<ParsingStatus>;
} => {
  const subject = new Subject<ParsingStatus>();

  const status: ParsingStatus = {
    rootFolder: newImportedFolder(0, null),
    parsingFile: null as File,
    queuedFiles: [] as File[],
  };

  let parsedFilesCount = 0;
  const parseQueuedFiles = async (): Promise<ImportedFolder> => {

    if (status.queuedFiles.length === 0) {
      return Promise.resolve(status.rootFolder);
    }

    const [current, ...nextFiles] = status.queuedFiles;
    status.parsingFile = current;
    status.queuedFiles = nextFiles;

    subject.next({...status});

    const importedFolder: ImportedFolder = await parseKMLFile(status.parsingFile);

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

    return parseQueuedFiles();
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
      return parseQueuedFiles();
    },
    get status() {
      return status;
    },
    statusObservable: () => subject,
  };
};
