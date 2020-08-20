import {v4 as uuid} from 'uuid';
import {ID} from '../app-rx/catalog';

export const makeId = (): ID => uuid();
