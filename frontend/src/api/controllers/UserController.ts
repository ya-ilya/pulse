import { AuthenticationContext, Session, axiosClient } from "../..";
import { useContext, useEffect, useState } from "react";

import { Axios } from "axios";
import { Controller } from "./Controller";
import { User } from "../models";

export function useUserController() {
  const [session] = useContext(AuthenticationContext);
  const [userController, setUserController] = useState(session ? createUserController(session) : undefined);

  useEffect(() => {
    if (session) {
      setUserController(createUserController(session));
    }
  }, [session]);

  return userController;
}

export function createUserController(session: Session) {
  return new UserController(axiosClient, session.accessToken);
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
