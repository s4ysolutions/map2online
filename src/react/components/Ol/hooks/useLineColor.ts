import {getTools} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
import {Color} from '../../../../lib/colors';

const tools = getTools();

const useLineColor = (): Color => useObservable(tools.colorLineObservable(), tools.colorLine);
export default useLineColor;
