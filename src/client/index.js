import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { combineReducers } from 'redux-immutablejs';

import reducers from 'reducers';
import App from 'containers/App';

const logger = createLogger({
  transformer: (state) => state.toJS()
});

const store = applyMiddleware(thunk, logger)(createStore)(combineReducers(reducers));

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app'));
