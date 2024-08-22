import {
  UpdateDisplayNameRequest,
  UpdateUsernameRequest,
  User,
} from "../models";
import axios, { Axios } from "axios";
import { useEffect, useState } from "react";

import { axiosClient } from "../..";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export function useMeController() {
  const [meController, setMeController] = useState(createMeController());
  const [token] = useLocalStorage("accessToken");

  useEffect(() => {
    setMeController(createMeController());
  }, [token]);

  return meController;
}

export function createMeController() {
  return new MeController(axiosClient, localStorage.getItem("accessToken")!);
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
