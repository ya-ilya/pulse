import { AuthenticationContext, Session, axiosClient } from "../..";
import { Channel, Message, UpdateMessageRequest } from "../models";
import { useContext, useEffect, useState } from "react";

import { Axios } from "axios";
import { Controller } from "./Controller";

export function useMessageController() {
  const [session] = useContext(AuthenticationContext);
  const [messageController, setMessageController] = useState(
    session ? createMessageController(session) : undefined
  );

  useEffect(() => {
    if (session) {
      setMessageController(createMessageController(session));
    }
  }, [session]);

  return messageController;
}

export function createMessageController(session: Session) {
  return new MessageController(axiosClient, session.accessToken);
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
