import {getTools} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
import {Color} from '../../../../lib/colors';

const tools = getTools();

const usePointColor = (): Color => useObservable(tools.colorPointObservable(), tools.colorPoint);
export default usePointColor;
