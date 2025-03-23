import axios, { Axios } from "axios";
import {
  refreshTokenRequestIntercepter,
  refreshTokenResponseIntercepter,
} from "..";

export abstract class Controller {
  protected client: Axios;

  constructor(client: Axios, baseURL: string, token: string | null = null) {
    this.client = axios.create({
      ...client.defaults,
      baseURL: client.defaults.baseURL + baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (token) {
      this.client.interceptors.request.use(refreshTokenRequestIntercepter);
      this.client.interceptors.response.use(
        (response) => response,
        refreshTokenResponseIntercepter
      );
    }
  }
}
