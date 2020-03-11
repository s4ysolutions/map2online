import {getTools} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';

const tools = getTools();

const usePointColor = () => useObservable(tools.colorPointObservable(), tools.colorPoint);
export default usePointColor;
