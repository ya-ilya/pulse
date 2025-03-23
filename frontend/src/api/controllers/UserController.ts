import { AuthenticationContext, AuthenticationData, axiosClient } from "../..";
import { useContext, useEffect, useState } from "react";

import { Axios } from "axios";
import { Controller } from "./Controller";
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

export class UserController extends Controller {
  constructor(client: Axios, token: string) {
    super(client, "/api/users", token);
  }

  async getUserById(userId: string): Promise<User> {
    return (await this.client.get(`/${userId}`)).data;
  }

  async getUserByUsername(username: string): Promise<User> {
    return (await this.client.get(`/by-username/${username}`)).data;
  }
}
