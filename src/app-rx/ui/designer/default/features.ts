import {Catalog, Feature} from '../../../catalog';
import {CatalogUI} from '../../catalog';
import {VisibleFeatures} from '../index';
import {merge} from 'rxjs';
import {map} from 'rxjs/operators';

export const visibleFeaturesFactory = (catalog: Catalog, catalogUI: CatalogUI): VisibleFeatures => {
  const findFeatures = () => {
    const features = [] as Feature[];
    for (const category of Array.from(catalog.categories)) {
      if (catalogUI.isVisible(category.id)) {
        for (const route of Array.from(category.routes)) {
          if (catalogUI.isVisible(route.id)) {
            for (const feature of Array.from(route.features)) {
              if (catalogUI.isVisible(feature.id)) {
                features.push(feature);
              }
            }
          }
        }
      }
    }
    return features;
  };
  let features = findFeatures();

  return {
    length: features.length,
    observable: function () {
      return merge(
        catalog.featuresObservable(),
        catalogUI.visibleObservable()
      ).pipe(
        map(() => {
          features = findFeatures();
          return this;
        })
      )
    }
    ,
    [Symbol.iterator](): Iterator<Feature> {
      const _features = [...features];
      let _current = 0;
      return {
        next: () => {
          return _current >= _features.length
            ? {done: true, value: null,}
            : {done: false, value: _features[_current++]};
        }
      }
    }
  }
};
