import { AuthenticationContext, AuthenticationData, axiosClient } from "../..";
import { UpdateDisplayNameRequest, User } from "../models";
import { useContext, useEffect, useState } from "react";

import { Axios } from "axios";
import { Controller } from "./Controller";

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

export class MeController extends Controller {
  constructor(client: Axios, token: string) {
    super(client, "/api/me", token);
  }

  async getUser(): Promise<User> {
    return (await this.client.get("")).data;
  }

  async updateDisplayName(body: UpdateDisplayNameRequest): Promise<User> {
    return (await this.client.patch("/displayName", body)).data;
  }
}
