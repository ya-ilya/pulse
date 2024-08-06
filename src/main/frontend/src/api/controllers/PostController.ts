import axios, { Axios } from "axios"
import { Channel, Post, UpdatePostRequest } from "../models"
import { axiosClient } from "../.."

export function createPostController() {
  return new PostController(axiosClient, localStorage.getItem('accessToken')!)
}

export class PostController {
  client: Axios

  constructor(client: Axios, token: string) {
    this.client = axios.create({
      baseURL: client.defaults.baseURL + "/api/posts",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  async getPostById(postId: number): Promise<Post> {
    return (await this.client.get(`/${postId}`)).data
  }

  async getComments(postId: number): Promise<Channel> {
    return (await this.client.get(`/${postId}/comments`)).data
  }

  async joinComments(postId: number): Promise<Channel> {
    return (await this.client.get(`/${postId}/comments/join`)).data
  }

  async updateMessage(postId: number, body: UpdatePostRequest): Promise<Post> {
    return (await this.client.patch(`/${postId}`, body)).data
  }

  async deleteMessage(postId: number) {
    this.client.delete(`/${postId}`)
  }
}