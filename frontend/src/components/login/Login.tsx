import "./Login.css";

import * as api from "../../api";

import { useCallback, useContext, useState } from "react";

import { AuthenticationContext } from "../..";
import { Navigate } from "react-router-dom";

function Login() {
  const authenticationController = api.useAuthenticationController();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [authenticationData, setAuthenticationData] = useContext(AuthenticationContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      if (isRegister) {
        authenticationController
          .signUp({ email, password, username })
          .then((response) => {
            setAuthenticationData({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              userId: response.userId,
              username: response.username,
            });
            setIsRegister(false);
          })
          .catch((error) => {
            switch (error.status) {
              case 400:
                setError("Invalid email or password. Please try again.");
                break;
              case 409:
                setError("User with same email or username already exists. Please try again.");
                break;
              default:
                setError("Registration failed. Please try again.");
                break;
            }
            setLoading(false);
          });
      } else {
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
          .catch((error) => {
            switch (error.status) {
              case 401:
                setError("Invalid password. Please try again.");
                break;
              case 404:
                setError("User not found. Please try again.");
                break;
              default:
                setError("Login failed. Please try again.");
                break;
            }
            setLoading(false);
          });
      }
    },
    [isRegister, email, password, username, authenticationController, setAuthenticationData]
  );

  if (authenticationData) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <div className="login">
      <form
        className="form"
        onSubmit={handleSubmit}
      >
        <div className="header">{isRegister ? "Register" : "Welcome"}</div>
        {isRegister && (
          <input
            type="text"
            placeholder="Username"
            className="input"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        )}
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
        <button
          type="submit"
          className="submit"
          disabled={loading}
        >
          {loading ? (isRegister ? "Registering..." : "Logging in...") : isRegister ? "Register" : "Login"}
        </button>
        <div className="toggle">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            className="link"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </div>
      </form>
    </div>
  );
}

export default Login;
