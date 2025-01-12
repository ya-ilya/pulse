import "./Login.css";

import * as api from "../../api";

import { Navigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useState } from "react";

function Login() {
  const authenticationController = api.useAuthenticationController();

  const [email, setEmail] = useState<string>("ilya@mail.com");
  const [password, setPassword] = useState<string>("password");
  const [authenticationData, setAuthenticationData] =
    useLocalStorage("authenticationData");

  function handleSubmit() {
    authenticationController
      .signIn({ email: email, password: password })
      .then((response) => {
        api
          .createMeControllerByAccessToken(response.accessToken)
          .getUser()
          .then((user) => {
            setAuthenticationData({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              user: user,
            });
          });
      });
  }

  if (authenticationData) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login">
      <div className="form">
        <div className="header">Welcome</div>
        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit" className="submit" onClick={handleSubmit}>
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
