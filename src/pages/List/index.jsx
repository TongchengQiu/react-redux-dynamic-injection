import React, { Component } from 'react';
import { connect } from 'react-redux';

import { increment, doubleAsync, key } from './reducer';

const mapStateToProps = (state) => ({
  count: state[key].count
});

const mapDispatchTpProps = {
  increment: () => increment(2),
  doubleAsync
};

class List extends Component {
  render() {
    const { count, increment, doubleAsync } = this.props;

    return (
      <div className='home__container'>
        <h3>List Counter: { count }</h3>
        <button onClick={increment}>List Increment</button>
        <br />
        <button onClick={doubleAsync}>List Double(Async)</button>
      </div>
    );
  }
};

export default connect(mapStateToProps, mapDispatchTpProps)(List);
