import { createReducer } from 'redux-immutablejs';
import Immutable from 'immutable';

export const initialState = Immutable.Map({
  width: 800,
  height: 600
});

export default createReducer(initialState, {
  'CHANGE_CANVAS': (domain, {width, height}) => {
    return domain.merge({width, height});
  }
});
