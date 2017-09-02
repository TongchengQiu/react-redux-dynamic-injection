import { injectReducer } from '../../store/reducerUtils';
import { store } from '../Root';
import Detail from './index.jsx';
import reducer, { key } from './reducer';

injectReducer(store, { key, reducer });

export default Detail;
