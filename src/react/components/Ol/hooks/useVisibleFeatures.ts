import {getDesigner} from '../../../../di-default';
import {olFeatureFactory} from '../lib/feature';
import {VisibleFeatures} from '../../../../app-rx/ui/designer';
import OlFeature from 'ol/Feature';
import useObservable from '../../../hooks/useObservable';
import {map} from 'rxjs/operators';
import {Feature} from '../../../../app-rx/catalog';
import {Observable} from 'rxjs';

const transformVisibleFeatures = (features: VisibleFeatures): OlFeature[] => Array.from<Feature>(features).map(feature => olFeatureFactory(feature));

const observable: Observable<OlFeature[]> = getDesigner()
  .visibleFeatures
  .observable()
  .pipe(map((f) => transformVisibleFeatures(f)));
// const visibleFeatures = () => transformVisibleFeatures(getDesigner().visibleFeatures);

const useVisibleFeatures = (): OlFeature[] => {
  const visibleFeatures: OlFeature[] = transformVisibleFeatures(getDesigner().visibleFeatures);
  return useObservable(observable, visibleFeatures);
};
export default useVisibleFeatures;
