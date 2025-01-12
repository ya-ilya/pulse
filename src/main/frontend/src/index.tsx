import "./index.css";

import * as api from "./api/index.ts";

import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import React, { useEffect, useState } from "react";

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

function ProtectedRoute() {
  const [lastEvent, setLastEvent] = useState<api.GatewayEvent | null>(null);
  const [authenticationData, setAuthneticationData] =
    useLocalStorage("authenticationData");

  useEffect(() => {
    const check = async () => {
      if (authenticationData) {
        if (!api.isGatewayOpen()) {
          api.createGatway(
            `${window.location.origin}/api/gateway`,
            authenticationData.accessToken,
            setLastEvent
          );
        }
      }
    };

    check().catch((error) => {
      console.error("Error during authentication check:", error);
      setAuthneticationData(null);
    });
  }, [authenticationData]);

  useEffect(() => {
    if (lastEvent?.type == "AuthenticationS2CEvent") {
      if (!lastEvent.state) {
        setAuthneticationData(null);
      }
    }
  }, [lastEvent]);

  return authenticationData ? (
    <AuthenticationContext.Provider
      value={[authenticationData, setAuthneticationData]}
    >
      <api.GatewayContext.Provider value={lastEvent}>
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
      </api.GatewayContext.Provider>
    </AuthenticationContext.Provider>
  ) : (
    <Navigate to="/login" replace />
  );
}

const router = createBrowserRouter([
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
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
