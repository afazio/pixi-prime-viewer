import React from 'react';
import { connect, bindActionCreators } from 'react-redux';
import { actionCreators } from 'reducers/canvas';

import PrimeViewer from 'components/PrimeViewer';

class App extends React.Component {
  render() {
    const { dispatch } = this.props;

    const actions = {
      changeCanvasSize: (width, height) => dispatch(actionCreators.changeCanvasSize(width, height))
    }

    return (
      <PrimeViewer {...this.props} {...actions} />
    );
  }
};

export default connect( (immutableState) => {
  const { canvas } = immutableState.toJS();
  return { canvas };
})(App);
