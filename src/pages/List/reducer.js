import { createReducer } from '../../store/reducerUtils';

export const key = 'list';

export const LIST_INCREMENT = `${key}/LIST_INCREMENT`;
export const LIST_DOUBLE_ASYNC = `${key}/LIST_DOUBLE_ASYNC`;

export const increment = (value = 1) => (
  {
    type: LIST_INCREMENT,
    payload: value
  }
);

export const doubleAsync = () => (
  (dispatch, getState) => (
    new Promise((resolve) => {
      setTimeout(() => {
        dispatch({
          type: LIST_DOUBLE_ASYNC,
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
  [LIST_INCREMENT]: (state, action) => ({
    ...state,
    count: state.count + action.payload
  }),
  [LIST_DOUBLE_ASYNC]: (state, action) => ({
    ...state,
    count: state.count * 2
  }),
};

const initalState = {
  count: 0
};

export default createReducer(initalState, ACTION_HANLDERS);
