import {FeatureType, Tools} from './index';
import {Color} from '../../../lib/colors';
import {KV} from '../../../kv-rx';

const toolsFactory = (persistStorage: KV): Tools => {
  const th: Tools = {
    colorLine: persistStorage.get('tcl', Color.RED),
    colorLineObservable: () => persistStorage.observable('tcl'),
    colorPoint: persistStorage.get('tcp', Color.RED),
    colorPointObservable: () => persistStorage.observable('tcp'),
    isLine: persistStorage.get('tt', FeatureType.Line) === FeatureType.Line,
    isLineObservable: () => persistStorage.observable('tt'),
    isPoint: persistStorage.get('tt', FeatureType.Point) === FeatureType.Point,
    isPointObservable: () => persistStorage.observable('tt'),
    selectColor: function (color: Color) {
      if (this.isLine) {
        persistStorage.set('tcl', color);
        this.colorLine = color;
      } else {
        persistStorage.set('tcp', color);
        this.colorPoint = color;
      }
    },
    selectLine: function () {
      persistStorage.set('tt', FeatureType.Line);
      this.tool = FeatureType.Line;
      this.isLine = true;
      this.isPoint = false;
    },
    selectPoint: function () {
      persistStorage.set('tt', FeatureType.Point);
      this.featureType = FeatureType.Point;
      this.isLine = false;
      this.isPoint = true;
    },
    featureType: persistStorage.get('tt', FeatureType.Point),
    featureTypeObservable: () => persistStorage.observable('tt'),
  };
  th.selectColor = th.selectColor.bind(th);
  th.selectLine = th.selectLine.bind(th);
  th.selectPoint = th.selectPoint.bind(th);
  return th;
};

export default toolsFactory;