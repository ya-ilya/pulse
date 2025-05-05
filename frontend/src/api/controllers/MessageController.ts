import { AuthenticationContext, AuthenticationData, axiosClient } from "../..";
import { Channel, Message, UpdateMessageRequest } from "../models";
import { useContext, useEffect, useState } from "react";

import { Axios } from "axios";
import { Controller } from "./Controller";

export function useMessageController() {
  const [authenticationData] = useContext(AuthenticationContext);
  const [messageController, setMessageController] = useState(
    authenticationData ? createMessageController(authenticationData) : undefined
  );

  useEffect(() => {
    if (authenticationData) {
      setMessageController(createMessageController(authenticationData));
    }
  }, [authenticationData]);

  return messageController;
}

export function createMessageController(authenticationData: AuthenticationData) {
  return new MessageController(axiosClient, authenticationData.accessToken);
}

export class MessageController extends Controller {
  constructor(client: Axios, token: string) {
    super(client, "/api/messages", token);
  }

  async getMessageById(messageId: number): Promise<Message> {
    return (await this.client.get(`/${messageId}`)).data;
  }

  async getComments(messageId: number): Promise<Channel> {
    return (await this.client.get(`/${messageId}/comments`)).data;
  }

  async joinComments(messageId: number): Promise<Channel> {
    return (await this.client.get(`/${messageId}/comments/join`)).data;
  }

  async updateMessage(messageId: number, body: UpdateMessageRequest): Promise<Message> {
    return (await this.client.patch(`/${messageId}`, body)).data;
  }

  async deleteMessage(messageId: number) {
    (await this.client.delete(`/${messageId}`)).data;
  }
}
