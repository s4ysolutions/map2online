import {Exporter} from '../index';
import {Category, Route} from '../../app-rx/catalog';
import {getRoutesKML} from '../lib/kml';

const MIME_KML = 'application/vnd.GoogleMap-earth.kml+xml'

const download = (file: string, content: string, mime: string): void => {
  const blob = new Blob([content], {type: mime})
  const a: HTMLAnchorElement = document.createElement('a')
  a.download = file
  a.href = window.URL.createObjectURL(blob)
  a.click()
}

export const exporterFactory = (): Exporter => {
  return {
    exportRoutesKML: (routes: Route[], category?: Category): void => {
      download(category ? `${category.title}.kml` : `map2.kml`, getRoutesKML(routes, category), MIME_KML)
    }
  };
}
