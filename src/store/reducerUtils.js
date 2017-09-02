import { combineReducers } from 'redux';

export const makeAllReducer = (asyncReducers) => combineReducers({
  ...asyncReducers
});

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return;

  store.asyncReducers[key] = reducer;
  store.replaceReducer(makeAllReducer(store.asyncReducers));
}

export const createReducer = (initialState, ACTION_HANDLES) => (
  (state = initialState, action) => {
    const handler = ACTION_HANDLES[action.type];
    return handler ? handler(state, action) : state;
  }
);
