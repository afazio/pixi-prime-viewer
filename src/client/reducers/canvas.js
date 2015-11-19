import { createReducer } from 'redux-immutablejs';
import Immutable from 'immutable';

export const initialState = Immutable.Map({
  width: 800,
  height: 600
});

export const actions = {
  CHANGE_CANVAS: 'CHANGE_CANVAS'
};

export const actionCreators = {
  changeCanvasSize: (width, height) => {
    return {type: actions.CHANGE_CANVAS, width, height};
  },
}

export default createReducer(initialState, {
  [actions.CHANGE_CANVAS]: (domain, {width, height}) => {
    return domain.merge({width, height});
  }
});
