import { InternalAxiosRequestConfig } from "axios";
import { Session } from "../..";
import { createAuthenticationController } from "./AuthenticationController";

export * from "./AuthenticationController";
export * from "./ChannelController";
export * from "./MeController";
export * from "./MessageController";
export * from "./UserController";

function isTokenExpired(token: string): boolean {
  const jwtPayload = JSON.parse(atob(token.split(".")[1]));
  return Date.now() >= jwtPayload.exp * 1000;
}

export async function refreshTokenResponseIntercepter(error: any) {
  const serializedSession = localStorage.getItem("session");
  if (!serializedSession) return Promise.reject(error);

  let session = JSON.parse(serializedSession) as Session;

  if (error.response.status === 403 || error.response.status === 401) {
    if (isTokenExpired(session.refreshToken)) {
      console.error("[response-intercepter] refreshToken expired");
      localStorage.removeItem("session");
      return Promise.reject(error);
    }

    try {
      console.info("[response-intercepter] Refreshing token");

      const refreshTokenResponse = await createAuthenticationController().refreshToken({
        refreshToken: session.refreshToken,
      });

      const newSession = JSON.stringify({
        accessToken: refreshTokenResponse.accessToken,
        refreshToken: refreshTokenResponse.refreshToken,
        userId: refreshTokenResponse.userId,
        username: refreshTokenResponse.username,
      });

      localStorage.setItem("session", newSession);

      window.dispatchEvent(
        new CustomEvent("localStorageChange", {
          detail: {
            key: "session",
            newValue: newSession,
          },
        })
      );

      console.info("[response-intercepter] Token refreshed");
    } catch (err) {
      console.error("[response-intercepter] Failed to refresh token:", err);
    }
  }

  return Promise.reject(error);
}

export async function refreshTokenRequestIntercepter(
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig<any>> {
  if (!config.headers["Authorization"]) return config;

  const serializedSession = localStorage.getItem("session");
  if (!serializedSession) return config;

  let session = JSON.parse(serializedSession) as Session;

  if (!isTokenExpired(session.accessToken)) return config;
  if (isTokenExpired(session.refreshToken)) {
    console.error("[request-intercepter] refreshToken expired");
    localStorage.removeItem("session");
    return config;
  }

  try {
    console.info("[request-intercepter] Refreshing token");

    const refreshTokenResponse = await createAuthenticationController().refreshToken({
      refreshToken: session.refreshToken,
    });

    const newSession = JSON.stringify({
      accessToken: refreshTokenResponse.accessToken,
      refreshToken: refreshTokenResponse.refreshToken,
      userId: refreshTokenResponse.userId,
      username: refreshTokenResponse.username,
    });

    localStorage.setItem("session", newSession);

    window.dispatchEvent(
      new CustomEvent("localStorageChange", {
        detail: {
          key: "session",
          newValue: newSession,
        },
      })
    );

    config.headers["Authorization"] = `Bearer ${refreshTokenResponse.accessToken}`;

    console.info("[request-intercepter] Token refreshed");
  } catch (err) {
    console.error("[request-intercepter] Failed to refresh token:", err);
  }

  return config;
}
