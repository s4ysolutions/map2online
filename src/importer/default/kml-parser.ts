import {ImportedFolder, Parser, ParsingStatus} from '../index';
import {Subject} from 'rxjs';
import sax from 'sax';
import {Coordinate, FeatureProps} from '../../app-rx/catalog';
import log from '../../log';
import {Color} from '../../lib/colors';
import {fromEPSG4326toEPSG3857} from '../../lib/projection';
import {makeId} from '../../l10n/id';

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
  const [lon0, lat0, alt] = triplet.split(',').map(t => Number.parseFloat(t));
  const [lon, lat] = fromEPSG4326toEPSG3857([lon0, lat0]);
  return {lon, lat, alt};
};

const parseCoordinates = (text: string): Coordinate[] =>
  text
    .trim()
    //.split(/\r?\n/)
    .split(/[^0-9.,]/)
    //.split("\n")
    .map(t => t.trim())
    .filter(t => !!t)
    .map(parseTriplet);

export const parseKMLString = (file: File, kml: string): Promise<ImportedFolder[]> => {
  const parser = sax.parser(true, {normalize: true, trim: true, xmlns: true});
  const rootFolders = [] as ImportedFolder[];
  const foldersStack = [] as ImportedFolder[];
  const parseStateStack = [ParseState.NONE] as ParseState[];
  const lastState = () => parseStateStack[parseStateStack.length - 1];
  const lastFolder = () => foldersStack.length === 0 ? null : foldersStack[foldersStack.length - 1];
  let currentFeature = null as FeatureProps;

  return new Promise<ImportedFolder[]>((rs, rj) => {
    parser.onopentag = (node) => {
      const name = node.name.toUpperCase();
      switch (name) {
        case 'DOCUMENT':
        case 'FOLDER':
          parseStateStack.push(ParseState.FOLDER);
          const nextFolder: ImportedFolder = {
            features: [],
            folders: [],
            name: '',
            description: '',
            level: foldersStack.length,
            parent: lastFolder(),
          };
          if (lastFolder()) {
            lastFolder().folders.push(nextFolder);
          } else {
            nextFolder.name = file.name;
            rootFolders.push(nextFolder);
          }
          foldersStack.push(nextFolder);
          break;
        case 'PLACEMARK':
          parseStateStack.push(ParseState.FEATURE);
          currentFeature = {
            color: Color.RED,
            description: '',
            geometry: null,
            id: makeId(),
            summary: '',
            title: '',
            visible: true,
          };
          lastFolder().features.push(currentFeature);
          break;
        case 'NAME':
          if (lastState() === ParseState.FOLDER) {
            parseStateStack.push(ParseState.FOLDER_NAME);
          } else if (lastState() === ParseState.FEATURE) {
            parseStateStack.push(ParseState.FEATURE_NAME);
          }
          break;
        case 'DESCRIPTION':
          if (lastState() === ParseState.FOLDER) {
            parseStateStack.push(ParseState.FOLDER_DESCRIPTION);
          } else if (lastState() === ParseState.FEATURE) {
            parseStateStack.push(ParseState.FEATURE_DESCRIPTION);
          }
          break;
        case 'COORDINATES':
          parseStateStack.push(ParseState.COORDINATES);
          break;
        default:
          parseStateStack.push(ParseState.UNKNOWN);
      }
    };
    parser.onclosetag = (nodeName) => {
      const name = nodeName.toUpperCase();
      switch (name) {
        case 'DOCUMENT':
        case 'FOLDER':
          const state = parseStateStack.pop();
          if (state !== ParseState.FOLDER) {
            log.warn('Folder or Document close tag does not match')
          } else {
            if (foldersStack.length === 0) {
              log.warn('No folders on the stack')
            }
            foldersStack.pop();
          }
          break;
        case 'DESCRIPTION':
        case 'NAME':
          if (lastState() === ParseState.FOLDER_NAME || lastState() === ParseState.FEATURE_NAME) {
            parseStateStack.pop();
          }
          break;
        case 'COORDINATES':
        case 'PLACEMARK':
        default:
          parseStateStack.pop();
      }
    };
    parser.ontext = (text) => {
      switch (lastState()) {
        case ParseState.FOLDER_NAME:
          lastFolder().name = text.trim();
          parseStateStack.pop();
          break;
        case ParseState.FEATURE_NAME:
          currentFeature.title = text.trim();
          parseStateStack.pop();
          break;
        case ParseState.FOLDER_DESCRIPTION:
          lastFolder().description = text.trim();
          parseStateStack.pop();
          break;
        case ParseState.FEATURE_DESCRIPTION:
          currentFeature.description = text.trim();
          parseStateStack.pop();
          break;
        case ParseState.COORDINATES:
          const coordinates = parseCoordinates(text.trim());
          if (coordinates.length === 1) {
            currentFeature.geometry = {
              coordinate: coordinates[0]
            };
          } else {
            currentFeature.geometry = {
              coordinates
            };
          }
          parseStateStack.pop();
          break;
      }
    };
    parser.onend = () => {
      rs(rootFolders);
    };
    parser.onerror = (e) => {
      rj(e);
    };
    parser.write(kml);
    parser.close();
  });
};

const parseKMLFile = (kml: File): Promise<ImportedFolder[]> => {
  const reader = new FileReader();
  return new Promise<string>((rs) => {
    reader.onload = (e => rs(e.target.result as string));
    reader.readAsText(kml)
  }).then(content => parseKMLString(kml, content));
};

export const kmlParserFactory = (): Parser => {
  const subject = new Subject<ParsingStatus>();

  const status: ParsingStatus = {
    importedFolders: [],
    parsingFile: null as File,
    queuedFiles: [] as File[]
  };

  const parseQueuedFiles = async (): Promise<void> => {

    if (status.queuedFiles.length === 0) {
      return Promise.resolve();
    }

    const [current, ...nextFiles] = status.queuedFiles;
    status.parsingFile = current;
    status.queuedFiles = nextFiles;

    subject.next({...status});

    const importedFolders = await parseKMLFile(status.parsingFile);
    status.importedFolders = status.importedFolders.concat(importedFolders);
    status.parsingFile = null;

    subject.next({...status});

    return parseQueuedFiles()
  };

  return {
    parse: function async(fileList: FileList): Promise<void> {
      status.importedFolders = [];
      status.parsingFile = null;
      status.queuedFiles = [];
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
  }
};