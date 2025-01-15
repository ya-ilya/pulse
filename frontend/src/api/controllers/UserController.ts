import { AuthenticationContext, AuthenticationData, axiosClient } from "../..";
import axios, { Axios } from "axios";
import { useContext, useEffect, useState } from "react";

import { User } from "../models";

export function useUserController() {
  const [authenticationData] = useContext(AuthenticationContext);
  const [userController, setUserController] = useState(
    authenticationData ? createUserController(authenticationData) : undefined
  );

  useEffect(() => {
    if (authenticationData) {
      setUserController(createUserController(authenticationData));
    }
  }, [authenticationData]);

  return userController;
}

export function createUserController(authenticationData: AuthenticationData) {
  return new UserController(axiosClient, authenticationData.accessToken);
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
