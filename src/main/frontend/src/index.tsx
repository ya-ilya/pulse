import "./index.css";

import {
  GatewayContext,
  createGatway,
  isGatewayOpen,
} from "./gateway/index.ts";
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

export const AuthenticationContext = React.createContext<User | null>(null);

function ProtectedRoute() {
  const [authenticated, setAuthenticated] = useState<boolean>();
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    const check = async () => {
      if (localStorage.getItem("accessToken")) {
        if (!isGatewayOpen()) {
          createGatway(`${window.location.origin}/api/gateway`, setLastEvent);
        }
      } else {
        setAuthenticated(false);
      }
    };

    check();
  }, []);

  useEffect(() => {
    if (lastEvent?.type == "AuthenticationEvent") {
      if (lastEvent.state === true) {
        setAuthenticated(true);
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAuthenticated(false);
      }
    }
  }, [lastEvent]);

  if (authenticated === undefined) {
    return <div></div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AuthenticationContext.Provider
      value={JSON.parse(localStorage.getItem("user")!)}
    >
      <GatewayContext.Provider value={lastEvent}>
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
      </GatewayContext.Provider>
    </AuthenticationContext.Provider>
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
