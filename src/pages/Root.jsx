import React, { Component} from 'react';
import { Provider } from 'react-redux';
import { Link, Switch, Route, BrowserRouter as Router } from 'react-router-dom';

import createStore from '../store/createStore';
import reducer, { key } from './rootReducer';

export const store  = createStore({} , {
  [key]: reducer
});

const lazyLoader = (importComponent) => (
  class AsyncComponent extends Component {
    state = { C: null }

    async componentDidMount () {
      const { default: C } = await importComponent();
      this.setState({ C });
    }

    render () {
      const { C } = this.state;
      return C ? <C {...this.props} /> : null;
    }
  }
);

export default class Root extends Component {
  render () {
    return (
      <div className='root__container'>
        <Provider store={store}>
          <Router>
            <div className='root__content'>
              <Link to='/'>Home</Link>
              <br />
              <Link to='/list'>List</Link>
              <br />
              <Link to='/detail'>Detail</Link>
              <Switch>
                <Route exact path='/'
                  component={lazyLoader(() => import('./Home'))}
                />
                <Route path='/list'
                  component={lazyLoader(() => import('./List'))}
                />
                <Route path='/detail'
                  component={lazyLoader(() => import('./Detail'))}
                />
              </Switch>
            </div>
          </Router>
        </Provider>
      </div>
    );
  }
}
