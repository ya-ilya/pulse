import { AuthenticationContext, AuthenticationData, axiosClient } from "../..";
import {
  Channel,
  CreateChannelRequest,
  CreateGroupChatRequest,
  CreateMessageRequest,
  CreatePrivateChatRequest,
  Message,
  UpdateChannelRequest,
  User,
} from "../models";
import axios, { Axios } from "axios";
import { refreshTokenRequestIntercepter, refreshTokenResponseIntercepter } from ".";
import { useContext, useEffect, useState } from "react";

export function useChannelController() {
  const [authenticationData] = useContext(AuthenticationContext);
  const [channelController, setChannelController] = useState(
    authenticationData ? createChannelController(authenticationData) : undefined
  );

  useEffect(() => {
    if (authenticationData) {
      setChannelController(createChannelController(authenticationData));
    }
  }, [authenticationData]);

  return channelController;
}

export function createChannelController(
  authenticationData: AuthenticationData
) {
  return new ChannelController(axiosClient, authenticationData.accessToken);
}

export class ChannelController {
  client: Axios;

  constructor(client: Axios, token: string) {
    this.client = axios.create({
      ...client.defaults,
      baseURL: client.defaults.baseURL + "/api/channels",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    this.client.interceptors.request.use(refreshTokenRequestIntercepter);
    this.client.interceptors.response.use((response) => response, refreshTokenResponseIntercepter);
  }

  async getChannels(): Promise<Channel[]> {
    return (await this.client.get("")).data;
  }

  async getChannelById(channelId: number): Promise<Channel> {
    return (await this.client.get(`/${channelId}`)).data;
  }

  async getChannelMembers(channelId: number): Promise<User[]> {
    return (await this.client.get(`/${channelId}/members`)).data;
  }

  async getMessages(channelId: number): Promise<Message[]> {
    return (await this.client.get(`/${channelId}/messages`)).data;
  }

  async createMessage(
    channelId: number,
    body: CreateMessageRequest
  ): Promise<Message> {
    return (await this.client.post(`/${channelId}/messages`, body)).data;
  }

  async createChannel(body: CreateChannelRequest): Promise<Channel> {
    return (await this.client.post("", body)).data;
  }

  async createPrivateChat(body: CreatePrivateChatRequest): Promise<Channel> {
    return (await this.client.post("/privateChat", body)).data;
  }

  async createGroupChat(body: CreateGroupChatRequest): Promise<Channel> {
    return (await this.client.post("/groupChat", body)).data;
  }

  async updateChannel(
    channelId: number,
    body: UpdateChannelRequest
  ): Promise<Channel> {
    return (await this.client.patch(`/${channelId}`, body)).data;
  }

  async deleteChannel(channelId: number) {
    this.client.delete(`/${channelId}`);
  }

  async join(channelId: number): Promise<Channel> {
    return (await this.client.get(`/${channelId}/join`)).data;
  }
}
