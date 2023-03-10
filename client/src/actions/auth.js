import axios from "axios";

import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
} from "./types";
import {setAlert} from "./alert";
import setAuthToken from "../utils/setAuthToken";

// Load user
export const loadUser = () => async dispatch => {

  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get('/api/auth');

    console.log('[reducers/auth.js::loadUser::res.data] ', res.data);

    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};


// Register user
export const register = ({name, email, password}) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const body = JSON.stringify({name, email, password});

  try {
    const res = await axios.post('/api/users', body, config);

    console.log('[reducers/auth.js::register::res.data] ', res.data);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });

    dispatch(loadUser());

  } catch (err) {
    // Get the errors from the response
    const errors = err.response.data.errors;

    // If there are errors, dispatch the setAlert action for each error
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: REGISTER_FAIL,
    });
  }
};


// Login user
export const login = ({email, password}) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const body = JSON.stringify({email, password});

  try {
    const res = await axios.post('/api/auth', body, config);

    console.log('[reducers/auth.js::login::res.data] ', res.data);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });

    dispatch(loadUser());

  } catch (err) {
    // Get the errors from the response
    const errors = err.response.data.errors;

    // If there are errors, dispatch the setAlert action for each error
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

// Logout / Clear profile
export const logout = () => dispatch => {
  // console.log('[reducers/auth.js::logout] ');
  dispatch({
    type: LOGOUT,
  });
};
