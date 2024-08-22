import { Channel, Message, UpdateMessageRequest } from "../models";
import axios, { Axios } from "axios";
import { useEffect, useState } from "react";

import { axiosClient } from "../..";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export function useMessageController() {
  const [messageController, setMessageController] = useState(
    createMessageController()
  );
  const [token] = useLocalStorage("accessToken");

  useEffect(() => {
    setMessageController(createMessageController());
  }, [token]);

  return messageController;
}

export function createMessageController() {
  return new MessageController(
    axiosClient,
    localStorage.getItem("accessToken")!
  );
}

export class MessageController {
  client: Axios;

  constructor(client: Axios, token: string) {
    this.client = axios.create({
      ...client.defaults,
      baseURL: client.defaults.baseURL + "/api/messages",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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

  async updateMessage(
    messageId: number,
    body: UpdateMessageRequest
  ): Promise<Message> {
    return (await this.client.patch(`/${messageId}`, body)).data;
  }

  async deleteMessage(messageId: number) {
    (await this.client.delete(`/${messageId}`)).data;
  }
}
