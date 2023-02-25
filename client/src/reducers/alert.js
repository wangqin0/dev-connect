import {REMOVE_ALERT, SET_ALERT} from "../actions/types";

const initState = [
  // {
  //   id: 1,
  //   msg: 'Please log in',
  //   alertType: 'success'
  // }
];

export default function(state = initState, action) {
  switch (action.type) {
    case SET_ALERT:
      return [...state, action.payload];
    case REMOVE_ALERT:
      return state.filter(alert => alert.id !== action.payload);
    default:
      // every reducer should have a default state
      return state;
  }
};
