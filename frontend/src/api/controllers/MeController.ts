import { AuthenticationContext, Session, axiosClient } from "../..";
import { UpdateDisplayNameRequest, User } from "../models";
import { useContext, useEffect, useState } from "react";

import { Axios } from "axios";
import { Controller } from "./Controller";

export function useMeController() {
  const [session] = useContext(AuthenticationContext);
  const [meController, setMeController] = useState(session ? createMeController(session) : undefined);

  useEffect(() => {
    if (session) {
      setMeController(createMeController(session));
    }
  }, [session]);

  return meController;
}

export function createMeController(session: Session) {
  return new MeController(axiosClient, session.accessToken);
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
