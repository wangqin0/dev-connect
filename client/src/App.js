import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Redux
import {Provider} from "react-redux";
import store from "./store";

import './App.css';

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="register" element={<Register/>}/>
        <Route path="login" element={<Login/>}/>
      </Routes>
    </BrowserRouter>
  </Provider>
);

export default App;
