import { AuthenticationData } from "../..";
import { InternalAxiosRequestConfig } from "axios";
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
  const authenticationDataString = localStorage.getItem("authenticationData");
  if (!authenticationDataString) return Promise.reject(error);

  let authenticationData = JSON.parse(authenticationDataString) as AuthenticationData;

  if (error.response.status === 403 || error.response.status === 401) {
    if (isTokenExpired(authenticationData.refreshToken)) {
      console.error("[response-intercepter] refreshToken expired");
      localStorage.removeItem("authenticationData");
      return Promise.reject(error);
    }

    try {
      console.info("[response-intercepter] Refreshing token");

      const refreshTokenResponse = await createAuthenticationController().refreshToken({
        refreshToken: authenticationData.refreshToken,
      });

      const newAuthenticationData = JSON.stringify({
        accessToken: refreshTokenResponse.accessToken,
        refreshToken: refreshTokenResponse.refreshToken,
        userId: refreshTokenResponse.userId,
        username: refreshTokenResponse.username,
      });

      localStorage.setItem("authenticationData", newAuthenticationData);

      window.dispatchEvent(
        new CustomEvent("localStorageChange", {
          detail: {
            key: "authenticationData",
            newValue: newAuthenticationData,
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

  const authenticationDataString = localStorage.getItem("authenticationData");
  if (!authenticationDataString) return config;

  let authenticationData = JSON.parse(authenticationDataString) as AuthenticationData;

  if (!isTokenExpired(authenticationData.accessToken)) return config;
  if (isTokenExpired(authenticationData.refreshToken)) {
    console.error("[request-intercepter] refreshToken expired");
    localStorage.removeItem("authenticationData");
    return config;
  }

  try {
    console.info("[request-intercepter] Refreshing token");

    const refreshTokenResponse = await createAuthenticationController().refreshToken({
      refreshToken: authenticationData.refreshToken,
    });

    const newAuthenticationData = JSON.stringify({
      accessToken: refreshTokenResponse.accessToken,
      refreshToken: refreshTokenResponse.refreshToken,
      userId: refreshTokenResponse.userId,
      username: refreshTokenResponse.username,
    });

    localStorage.setItem("authenticationData", newAuthenticationData);

    window.dispatchEvent(
      new CustomEvent("localStorageChange", {
        detail: {
          key: "authenticationData",
          newValue: newAuthenticationData,
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
