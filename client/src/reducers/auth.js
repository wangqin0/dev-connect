import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL
} from "../actions/types";

// The initial state of the auth reducer. Define it separately to avoid clutter in the reducer function parameters.
// The token is stored in localStorage, so we can access it from there
const initState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
};

export default function (state = initState, action) {
  switch (action.type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      };
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      // put token to localStorage
      localStorage.setItem('token', action.payload.token);

      console.log('[reducers/auth.js] ', action.payload.token);

      const successReturn = {
        ...state,
        ...action.payload,    // token
        isAuthenticated: true,
        loading: false,
      }
      console.log(successReturn);
      return successReturn;

    case REGISTER_FAIL:
    case AUTH_ERROR:
    case LOGIN_FAIL:
      // many action error type will be handled here,
      // basically we don't want to have an invalid token in localStorage/state

      // remove token from localStorage
      localStorage.removeItem('token');

      const failReturn = {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
      console.log(failReturn);
      return failReturn;

    default:
      return state;
  }
};
