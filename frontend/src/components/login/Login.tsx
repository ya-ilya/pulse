import "./Login.css";

import * as api from "../../api";

import { useCallback, useContext, useState } from "react";

import { AuthenticationContext } from "../..";
import { Navigate } from "react-router-dom";

function Login() {
  const authenticationController = api.useAuthenticationController();

  const [email, setEmail] = useState<string>("ilya@mail.com");
  const [password, setPassword] = useState<string>("password");
  const [authenticationData, setAuthenticationData] = useContext(
    AuthenticationContext
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      authenticationController
        .signIn({ email, password })
        .then((response) => {
          setAuthenticationData({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            userId: response.userId,
            username: response.username,
          });
        })
        .catch(() => {
          setError("Invalid email or password.");
          setLoading(false);
        });
    },
    [email, password, authenticationController, setAuthenticationData]
  );

  if (authenticationData) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login">
      <form className="form" onSubmit={handleSubmit}>
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
        {error && <div className="error">{error}</div>}
        <button type="submit" className="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
