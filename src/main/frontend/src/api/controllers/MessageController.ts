import axios, { Axios } from "axios"
import { Message, UpdateMessageRequest } from "../models"
import { axiosClient } from "../.."

export function createMessageController() {
  return new MessageController(axiosClient, localStorage.getItem('accessToken')!)
}

export class MessageController {
  client: Axios

  constructor(client: Axios, token: string) {
    this.client = axios.create({
      ...client.defaults,
      baseURL: client.defaults.baseURL + "/api/messages",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  async getMessageById(messageId: number): Promise<Message> {
    return (await this.client.get(`/${messageId}`)).data
  }

  async updateMessage(messageId: number, body: UpdateMessageRequest): Promise<Message> {
    return (await this.client.patch(`/${messageId}`, body)).data
  }

  async deleteMessage(messageId: number) {
    (await this.client.delete(`/${messageId}`)).data
  }
}