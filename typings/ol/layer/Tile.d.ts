import BaseTileLayer from './BaseTile';
import TileSource from '../source/Tile';

interface TileLayerOptions {
  source: TileSource;
}

export default class TileLayer extends BaseTileLayer {
  constructor(opts: TileLayerOptions);
}