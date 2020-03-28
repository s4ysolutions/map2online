import {getTransform} from 'ol/proj';

export const fromEPSG4326toEPSG3857 = getTransform('EPSG:4326', 'EPSG:3857');
