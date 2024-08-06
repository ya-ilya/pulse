import axios, { Axios } from "axios";
import { AuthenticationResponse, RefreshTokenRequest, SignInRequest, SignUpRequest } from "../models";
import { axiosClient } from "../..";

export function creaateAuthenticationController() {
  return new AuthenticationController(axiosClient)
}

export class AuthenticationController {
  client: Axios

  constructor(client: Axios) {
    this.client = axios.create({
      ...client.defaults,
      baseURL: client.defaults.baseURL + "/authentication",
      headers: client.defaults.headers
    })
  }

  async signIn(body: SignInRequest): Promise<AuthenticationResponse> {
    return (await this.client.post('/sign-in', body)).data
  }

  async signUp(body: SignUpRequest): Promise<AuthenticationResponse> {
    return (await this.client.post('/sign-up', body)).data
  }

  async refreshToken(body: RefreshTokenRequest): Promise<AuthenticationResponse> {
    return (await this.client.post('/refreshToken', body)).data
  }
}