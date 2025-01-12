import { AuthenticationContext, AuthenticationData, axiosClient } from "../..";
import {
  UpdateDisplayNameRequest,
  UpdateUsernameRequest,
  User,
} from "../models";
import axios, { Axios } from "axios";
import { useContext, useEffect, useState } from "react";

export function useMeController() {
  const [authenticationData] = useContext(AuthenticationContext);
  const [meController, setMeController] = useState(
    authenticationData ? createMeController(authenticationData) : undefined
  );

  useEffect(() => {
    if (authenticationData) {
      setMeController(createMeController(authenticationData));
    }
  }, [authenticationData]);

  return meController;
}

export function createMeController(authenticationData: AuthenticationData) {
  return new MeController(axiosClient, authenticationData.accessToken);
}

export function createMeControllerByAccessToken(accessToken: string) {
  return new MeController(axiosClient, accessToken);
}

export class MeController {
  client: Axios;

  constructor(client: Axios, token: string) {
    this.client = axios.create({
      ...client.defaults,
      baseURL: client.defaults.baseURL + "/api/me",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getUser(): Promise<User> {
    return (await this.client.get("")).data;
  }

  async updateUsername(body: UpdateUsernameRequest): Promise<User> {
    return (await this.client.patch("/username", body)).data;
  }

  async updateDisplayName(body: UpdateDisplayNameRequest): Promise<User> {
    return (await this.client.patch("/displayName", body)).data;
  }
}
