import {
  AuthenticationResponse,
  RefreshTokenRequest,
  SignInRequest,
  SignUpRequest,
} from "../models";

import { Axios } from "axios";
import { Controller } from "./Controller";
import { axiosClient } from "../..";
import { useState } from "react";

export function useAuthenticationController() {
  const [authenticationController] = useState(createAuthenticationController());

  return authenticationController;
}

export function createAuthenticationController() {
  return new AuthenticationController(axiosClient);
}

export class AuthenticationController extends Controller {
  constructor(client: Axios) {
    super(client, "/authentication", null);
  }

  async signIn(body: SignInRequest): Promise<AuthenticationResponse> {
    return (await this.client.post("/sign-in", body)).data;
  }

  async signUp(body: SignUpRequest): Promise<AuthenticationResponse> {
    return (await this.client.post("/sign-up", body)).data;
  }

  async refreshToken(
    body: RefreshTokenRequest
  ): Promise<AuthenticationResponse> {
    return (await this.client.post("/refreshToken", body)).data;
  }
}
