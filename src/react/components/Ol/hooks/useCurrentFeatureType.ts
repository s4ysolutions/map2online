import {getTools} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';

const tools = getTools();

const useCurrentFeatureType = () => useObservable(tools.featureTypeObservable(), tools.featureType);
export default useCurrentFeatureType;
