import { AuthenticationContext, Session, axiosClient } from "../..";
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
import { useContext, useEffect, useState } from "react";

import { Axios } from "axios";
import { Controller } from "./Controller";

export function useChannelController() {
  const [session] = useContext(AuthenticationContext);
  const [channelController, setChannelController] = useState(
    session ? createChannelController(session) : undefined
  );

  useEffect(() => {
    if (session) {
      setChannelController(createChannelController(session));
    }
  }, [session]);

  return channelController;
}

export function createChannelController(session: Session) {
  return new ChannelController(axiosClient, session.accessToken);
}

export class ChannelController extends Controller {
  constructor(client: Axios, token: string) {
    super(client, "/api/channels", token);
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

  async createMessage(channelId: number, body: CreateMessageRequest): Promise<Message> {
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

  async updateChannel(channelId: number, body: UpdateChannelRequest): Promise<Channel> {
    return (await this.client.patch(`/${channelId}`, body)).data;
  }

  async deleteChannel(channelId: number) {
    this.client.delete(`/${channelId}`);
  }

  async leaveChannel(channelId: number) {
    this.client.get(`/${channelId}/leave`);
  }

  async join(channelId: number): Promise<Channel> {
    return (await this.client.get(`/${channelId}/join`)).data;
  }
}
