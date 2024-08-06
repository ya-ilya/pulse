import axios, { Axios } from "axios"
import { UpdateDisplayNameRequest, UpdateUsernameRequest, User } from "../models"
import { axiosClient } from "../.."

export function createMeController() {
  return new MeController(axiosClient, localStorage.getItem('accessToken')!)
}

export class MeController {
  client: Axios

  constructor(client: Axios, token: string) {
    this.client = axios.create({
      ...client.defaults,
      baseURL: client.defaults.baseURL + "/api/me",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  async getUser(): Promise<User> {
    return (await this.client.get('')).data
  }

  async updateUsername(body: UpdateUsernameRequest): Promise<User> {
    return (await this.client.patch('/username', body)).data
  }

  async updateDisplayName(body: UpdateDisplayNameRequest): Promise<User> {
    return (await this.client.patch('/displayName', body)).data
  }
}