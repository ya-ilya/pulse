import axios, { Axios } from "axios";
import { useEffect, useState } from "react";

import { User } from "../models";
import { axiosClient } from "../..";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export function useUserController() {
  const [userController, setUserController] = useState(createUserController());
  const [token] = useLocalStorage("accessToken");

  useEffect(() => {
    setUserController(createUserController());
  }, [token]);

  return userController;
}

export function createUserController() {
  return new UserController(axiosClient, localStorage.getItem("accessToken")!);
}

export class UserController {
  client: Axios;

  constructor(client: Axios, token: string) {
    this.client = axios.create({
      ...client.defaults,
      baseURL: client.defaults.baseURL + "/api/users",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getUserById(userId: string): Promise<User> {
    return (await this.client.get(`/${userId}`)).data;
  }

  async getUserByUsername(username: string): Promise<User> {
    return (await this.client.get(`/by-username/${username}`)).data;
  }
}
