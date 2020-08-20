import {getTools} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
import {FeatureType} from '../../../../app-rx/ui/tools';

const tools = getTools();

const useCurrentFeatureType = ():FeatureType => useObservable(tools.featureTypeObservable(), tools.featureType);
export default useCurrentFeatureType;
