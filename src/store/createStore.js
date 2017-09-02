import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';

import { makeAllReducer } from './reducerUtils';

export default (initialState = {}, initialReducer = {}) => {
  const middlewares = [thunk];

  const enhancers = [];

  if (process.env.NODE_ENV === 'development') {
    const devToolsExtension = window.devToolsExtension;
    if (typeof devToolsExtension === 'function') {
      enhancers.push(devToolsExtension());
    }
  }

  const store = createStore(
    makeAllReducer(initialReducer),
    initialState,
    compose(
      applyMiddleware(...middlewares),
      ...enhancers
    )
  );

  store.asyncReducers = {
    ...initialReducer
  };

  return store;
}
