import {ImportedFolder} from './index';

export const newImportedFolder = (level: number, parent: ImportedFolder | null): ImportedFolder => ({
  features: [],
  folders: [],
  name: '',
  description: '',
  level,
  parent,
});

