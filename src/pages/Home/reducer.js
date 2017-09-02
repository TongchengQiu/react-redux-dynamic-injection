import { createReducer } from '../../store/reducerUtils';

export const key = 'home';

export const HOME_INCREMENT = `${key}/HOME_INCREMENT`;
export const HOME_DOUBLE_ASYNC = `${key}/HOME_DOUBLE_ASYNC`;

export const increment = (value = 1) => (
  {
    type: HOME_INCREMENT,
    payload: value
  }
);

export const doubleAsync = () => (
  (dispatch, getState) => (
    new Promise((resolve) => {
      setTimeout(() => {
        dispatch({
          type: HOME_DOUBLE_ASYNC,
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
  [HOME_INCREMENT]: (state, action) => ({
    ...state,
    count: state.count + action.payload
  }),
  [HOME_DOUBLE_ASYNC]: (state, action) => ({
    ...state,
    count: state.count * 2
  }),
};

const initalState = {
  count: 0
};

export default createReducer(initalState, ACTION_HANLDERS);
