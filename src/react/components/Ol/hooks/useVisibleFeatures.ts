import {getDesigner} from '../../../../di-default';
import {olFeatureFactory} from '../lib/feature';
import {VisibleFeatures} from '../../../../app-rx/ui/designer';
import OlFeature from 'ol/Feature';
import useObservable from '../../../hooks/useObservable';
import {map} from 'rxjs/operators';

const transformVisibleFeatures = (features: VisibleFeatures): OlFeature => Array.from(features).map(feature => olFeatureFactory(feature));
const visibleFeatures = () => transformVisibleFeatures(getDesigner().visibleFeatures);

const useVisibleFeatures = () => useObservable(getDesigner().visibleFeatures.observable().pipe(map(transformVisibleFeatures)), Array.from(visibleFeatures()));
export default useVisibleFeatures;