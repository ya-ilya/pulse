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

export class Session {
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
  [session: Session | null, setSession: (session: Session | null) => void]
>([null, () => {}]);

function AuthenticationRoute() {
  const [session, setSession] = useLocalStorage<Session>("session");

  return (
    <AuthenticationContext.Provider value={[session, setSession]}>
      <Outlet />
    </AuthenticationContext.Provider>
  );
}

function ProtectedRoute() {
  const [session, setSession] = useContext(AuthenticationContext);

  useEffect(() => {
    if (session) {
      if (api.isGatewayOpen()) return;

      api.connectToGateway(`ws://127.0.0.1:3000/gateway`, session!.accessToken);
    } else {
      api.closeGateway();
    }
  }, [session]);

  api.onGatewayEvent({
    AuthenticationS2CEvent: (event) => {
      if (!event.state) setSession(null);
    },
    ErrorS2CEvent: (event) => {
      console.error(event.error);
    },
  });

  api.onGatewayClose(() => {
    if (session) setSession(null);
  });

  return session ? (
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
