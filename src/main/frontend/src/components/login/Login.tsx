import "./Login.css";

import * as api from "../../api";

import { Navigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const authenticationController = api.useAuthenticationController();

  const [email, setEmail] = useState<string>("ilya@mail.com");
  const [password, setPassword] = useState<string>("password");
  const [done, setDone] = useState(localStorage.getItem("accessToken") != null);

  function handleSubmit() {
    authenticationController
      .signIn({ email: email, password: password })
      .then((response) => {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        api
          .createMeController()
          .getUser()
          .then((user) => {
            localStorage.setItem("user", JSON.stringify(user));
            setDone(true);
          });
      });
  }

  if (done) {
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
