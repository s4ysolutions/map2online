import {getTools} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';

const tools = getTools();

const useLineColor = () => useObservable(tools.colorLineObservable(), tools.colorLine);
export default useLineColor;
