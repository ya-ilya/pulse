import "./index.css";

import * as api from "./api/index.ts";

import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import React, { useContext, useEffect } from "react";

import App from "./App.tsx";
import Login from "./components/login/Login.tsx";
import ReactDOM from "react-dom/client";
import { User } from "./api/index.ts";
import axios from "axios";
import { useLocalStorage } from "./hooks/useLocalStorage.ts";

export const axiosClient = axios.create({
  baseURL: window.location.origin,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export class AuthenticationData {
  accessToken: string;
  refreshToken: string;
  user: User;

  constructor(accessToken: string, refreshToken: string, user: User) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}

export const AuthenticationContext = React.createContext<
  [
    data: AuthenticationData | null,
    setData: (data: AuthenticationData | null) => void
  ]
>([null, () => {}]);

function AuthenticatableRoute() {
  const [authenticationData, setAuthneticationData] =
    useLocalStorage("authenticationData");

  return (
    <AuthenticationContext.Provider
      value={[authenticationData, setAuthneticationData]}
    >
      <Outlet />
    </AuthenticationContext.Provider>
  );
}

function ProtectedRoute() {
  const [authenticationData, setAuthneticationData] = useContext(
    AuthenticationContext
  );

  useEffect(() => {
    const connectToGateway = async () => {
      if (api.isGatewayOpen()) return;

      api.connectToGatway(
        `${window.location.origin}/api/gateway`,
        authenticationData!.accessToken
      );
    };

    if (authenticationData) {
      connectToGateway();
    }
  }, [authenticationData]);

  api.subscribeToGateway({
    AuthenticationS2CEvent: (event) => {
      if (!event.state) setAuthneticationData(null);
    },
  });

  return authenticationData ? (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  ) : (
    <Navigate to="/login" replace />
  );
}

const router = createBrowserRouter([
  {
    element: <AuthenticatableRoute />,
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
