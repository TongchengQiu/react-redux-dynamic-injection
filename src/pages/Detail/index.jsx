import React, { Component } from 'react';
import { connect } from 'react-redux';

import { increment, doubleAsync, key } from './reducer';

const mapStateToProps = (state) => ({
  count: state[key].count
});

const mapDispatchTpProps = {
  increment: () => increment(4),
  doubleAsync
};

class Detail extends Component {
  render() {
    const { count, increment, doubleAsync } = this.props;

    return (
      <div className='home__container'>
        <h3>Detail Counter: { count }</h3>
        <button onClick={increment}>Detail Increment</button>
        <br />
        <button onClick={doubleAsync}>Detail Double(Async)</button>
      </div>
    );
  }
};

export default connect(mapStateToProps, mapDispatchTpProps)(Detail);
