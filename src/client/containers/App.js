import React from 'react';
import { connect } from 'react-redux';

import PrimeViewer from 'components/PrimeViewer';

class App extends React.Component {
  render() {
    return (
      <PrimeViewer {...this.props} />
    );
  }
};

export default connect( (immutableState) => {
  const { canvas } = immutableState.toJS();
  return { canvas };
})(App);
