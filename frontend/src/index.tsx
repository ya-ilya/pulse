import "./index.css";

import * as api from "./api/index.ts";

import { Navigate, Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import React, { useContext, useEffect } from "react";

import App from "./App.tsx";
import Login from "./components/login/Login.tsx";
import { QueryClientProvider } from "react-query";
import ReactDOM from "react-dom/client";
import { queryClient } from "./config.ts";
import { useLocalStorage } from "./hooks/useLocalStorage.ts";

export * from "./config.ts";

export class AuthenticationData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;

  constructor(accessToken: string, refreshToken: string, userId: string, username: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.userId = userId;
    this.username = username;
  }
}

export const AuthenticationContext = React.createContext<
  [data: AuthenticationData | null, setData: (data: AuthenticationData | null) => void]
>([null, () => {}]);

function AuthenticationRoute() {
  const [authenticationData, setAuthenticationData] =
    useLocalStorage<AuthenticationData>("authenticationData");

  return (
    <AuthenticationContext.Provider value={[authenticationData, setAuthenticationData]}>
      <Outlet />
    </AuthenticationContext.Provider>
  );
}

function ProtectedRoute() {
  const [authenticationData, setAuthenticationData] = useContext(AuthenticationContext);

  useEffect(() => {
    if (authenticationData) {
      if (api.isGatewayOpen()) return;

      api.connectToGateway(`ws://127.0.0.1:3000/gateway`, authenticationData!.accessToken);
    } else {
      api.closeGateway();
    }
  }, [authenticationData]);

  api.onGatewayEvent({
    AuthenticationS2CEvent: (event) => {
      if (!event.state) setAuthenticationData(null);
    },
    ErrorS2CEvent: (event) => {
      console.error(event.error);
    },
  });

  api.onGatewayClose(() => {
    if (authenticationData) setAuthenticationData(null);
  });

  return authenticationData ? (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  ) : (
    <Navigate
      to="/login"
      replace
    />
  );
}

const router = createBrowserRouter([
  {
    element: <AuthenticationRoute />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: <App />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
