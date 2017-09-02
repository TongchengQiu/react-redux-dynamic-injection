import React, { Component } from 'react';
import { connect } from 'react-redux';

import { increment, doubleAsync, key } from './reducer';

const mapStateToProps = (state) => ({
  count: state[key].count
});

const mapDispatchTpProps = {
  increment: () => increment(1),
  doubleAsync
};

class Home extends Component {
  render() {
    const { count, increment, doubleAsync } = this.props;

    return (
      <div className='home__container'>
        <h3>Counter: { count }</h3>
        <button onClick={increment}>Increment</button>
        <br />
        <button onClick={doubleAsync}>Double(Async)</button>
      </div>
    );
  }
};

export default connect(mapStateToProps, mapDispatchTpProps)(Home);
