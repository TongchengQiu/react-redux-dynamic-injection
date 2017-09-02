import { createReducer } from '../../store/reducerUtils';

export const key = 'detail';

export const DETAIL_INCREMENT = `${key}/DETAIL_INCREMENT`;
export const DETAIL_DOUBLE_ASYNC = `${key}/DETAIL_DOUBLE_ASYNC`;

export const increment = (value = 1) => (
  {
    type: DETAIL_INCREMENT,
    payload: value
  }
);

export const doubleAsync = () => (
  (dispatch, getState) => (
    new Promise((resolve) => {
      setTimeout(() => {
        dispatch({
          type: DETAIL_DOUBLE_ASYNC,
          payload: null
        });
        resolve();
      }, 200);
    })
  )
);

export const actions = {
  increment,
  doubleAsync
};

const ACTION_HANLDERS = {
  [DETAIL_INCREMENT]: (state, action) => ({
    ...state,
    count: state.count + action.payload
  }),
  [DETAIL_DOUBLE_ASYNC]: (state, action) => ({
    ...state,
    count: state.count * 2
  }),
};

const initalState = {
  count: 0
};

export default createReducer(initalState, ACTION_HANLDERS);
