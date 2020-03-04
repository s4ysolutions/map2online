import OSM, {ATTRIBUTION as osmAttributions} from 'ol/source/OSM';
import BingMaps from 'ol/source/BingMaps';
import Projection from 'ol/proj/Projection';
import Source from 'ol/source/Source';
import XYZ from 'ol/source/XYZ';
// eslint-disable-next-line no-duplicate-imports
import {transform} from 'ol/proj/transforms';

export type CoordTriple = [number, number, number]

type TransformCoordFunction = (source: Source, coordTriple: CoordTriple) => CoordTriple

export interface MapDefinition {
  id: string;
  proj?: Projection;
  olSourceFactory?: () => Source;
  toLonLat?: TransformCoordFunction;
}

export interface MapGroupDefinition {
  id: string;
  maps: MapDefinition[];
}

const BING_OPTIONS = {
  hidpi: true,
  imagerySet: 'Road',
  key: 'Ap2Mc9TDvyGwBCYlIsh_Ji_kzGzakjjIiHXkK9aOw283M6PO8vw235v6tc8hXY-g',
  wrapX: false,
};

const siteAttribution =
  'Map2Online © <a href="https://s4y.solutions/">S4Y</a> 1.0.1-beta';

/**
 * every map will have `toLonLat(coord)` function
 */
const toLonLatFunction = (dest: Projection): TransformCoordFunction => (
  source: Source,
  coord: CoordTriple
): CoordTriple => transform(coord, source, dest);

const addProjToMap = (map: MapDefinition): MapDefinition => ({
  ...map,
  toLonLat: toLonLatFunction(map.proj || {getCode: (): string => 'EPSG:4326'}),
});

const mapGroups: MapGroupDefinition[] = [
  {
    id: 'OSM',
    maps: [
      {
        id: 'Openstreet',
        olSourceFactory: (): Source => new XYZ({
          attributions: [
            siteAttribution,
            osmAttributions,
          ],
          url:
            'http://tiles-proxy-a.s4y.solutions/openstreet/{z}/{x}/{y}.png',
        }),
      },
      {
        id: 'ThunderforestCycle',
        olSourceFactory: (): Source => new OSM({
          attributions: [
            siteAttribution,
            osmAttributions,
          ],
          url: 'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
        }),
      },
    ],
  },
  {
    id: 'Google',
    maps: [
      {id: 'GoogleLandscape'},
      {id: 'GoogleMap'},
      {id: 'GoogleSattelite'},
      {id: 'GoogleTrasport'},
    ],
  },
  {
    id: 'Yandex',
    maps: [
      {id: 'YandexMap'},
      {id: 'YandexPublic'},
      {id: 'YandexSatellite'},
    ],
  },
  {
    id: 'Nokia',
    maps: [],
  },
  {
    id: 'Cosmos',
    maps: [],
  },
  {
    id: 'Navteq',
    maps: [],
  },
  {
    id: 'GeoHub',
    maps: [],
  },
  {
    id: 'Moscow',
    maps: [],
  },
  {
    id: 'Bing',
    maps: [
      {
        id: 'BingRoads',
        olSourceFactory: (): Source => new BingMaps({
          ...BING_OPTIONS,
          imagerySet: 'RoadOnDemand',
        }),
      },
      {
        id: 'BingSattelite',
        olSourceFactory: (): Source => new BingMaps({
          ...BING_OPTIONS,
          imagerySet: 'Aerial',
        }),
      },
      {
        id: 'BingSatteliteLabels',
        olSourceFactory: (): Source => new BingMaps({
          ...BING_OPTIONS,
          imagerySet: 'AerialWithLabelsOnDemand',
        }),
      },
      {
        id: 'BingStreetside',
        olSourceFactory: (): Source => new BingMaps({
          ...BING_OPTIONS,
          centerPoint: [
            0,
            0,
          ],
          imagerySet: 'Streetside',
        }),
      },
      {
        id: 'BingBirdsEye',
        olSourceFactory: (): Source => new BingMaps({
          ...BING_OPTIONS,
          centerPoint: [
            0,
            0,
          ],
          imagerySet: 'BirdseyeV2',
        }),
      },
      {
        id: 'BingBirdsEyeLabels',
        olSourceFactory: (): Source => new BingMaps({
          ...BING_OPTIONS,
          centerPoint: [
            0,
            0,
          ],
          imagerySet: 'BirdseyeV2WithLabels',
        }),
      },
    ],
  },
  {
    id: 'GeoPortal',
    maps: [],
  },
  {
    id: 'Yahoo',
    maps: [],
  },
  {
    id: 'Others',
    maps: [],
  },
  {
    id: 'Mailru',
    maps: [],
  },
  {
    id: 'Historical',
    maps: [],
  },
  {
    id: 'Tourist',
    maps: [],
  },
  {
    id: 'Marina',
    maps: [],
  },
  {
    id: 'Space',
    maps: [],
  },
  {
    id: 'LocalMaps',
    maps: [],
  },
  {
    id: 'Genshtab',
    maps: [
      {
        id: 'Map2Online',
        olSourceFactory: (): Source => new XYZ({
          url:
            'http://tiles-proxy-a.s4y.solutions/gsh/?al=1&i=1&x={x}&y={y}&z={z}',
        }),
      },
    ],
  },
  {
    id: 'ESRI',
    maps: [],
  },
  {
    id: 'GoogleEarth',
    maps: [],
  },
].map((group: MapGroupDefinition): MapGroupDefinition => ({
  ...group,
  maps: group.maps.map((map: MapDefinition): MapDefinition => addProjToMap(map)),
}));

const memo: Record<string, MapDefinition> = {};

export const getMapDefinition = (sourceName: string): MapDefinition => {
  if (memo[sourceName]) {
    return memo[sourceName];
  }
  for (const mgd of mapGroups) {
    for (const md of mgd.maps) {
      if (md.id === sourceName) {
        console.log({md});
        memo[sourceName] = md;
        return md;
      }
    }
  }
  memo[sourceName] = null;
  return null;
};

export default mapGroups;
