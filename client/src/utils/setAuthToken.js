import axios from "axios";

const setAuthToken = token => {
  if (token) {
    // Set the token to the header
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    // Remove the token from the header
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

export default setAuthToken;
