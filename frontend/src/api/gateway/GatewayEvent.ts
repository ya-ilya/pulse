import { Channel, Message, User } from "../models";

export interface GatewayEvent {
  type: string;
  [key: string]: any;
}

export interface AuthenticationC2SEvent extends GatewayEvent {
  type: "AuthenticationC2SEvent";
  token: string;
}

export interface TypingC2SEvent extends GatewayEvent {
  type: "TypingC2SEvent";
  channelId: number;
}

export interface AuthenticationS2CEvent extends GatewayEvent {
  type: "AuthenticationS2CEvent";
  authenticated: boolean;
}

export interface TypingS2CEvent extends GatewayEvent {
  type: "TypingS2CEvent";
  channelId: number;
  userId: string;
  username: string;
}

export interface ErrorS2CEvent extends GatewayEvent {
  type: "ErrorS2CEvent";
  message: string;
}

export interface CreateChannelS2CEvent extends GatewayEvent {
  type: "CreateChannelS2CEvent";
  channel: Channel;
}

export interface DeleteChannelS2CEvent extends GatewayEvent {
  type: "DeleteChannelS2CEvent";
  channelId: number;
}

export interface UpdateChannelNameS2CEvent extends GatewayEvent {
  type: "UpdateChannelNameS2CEvent";
  channelId: number;
  name: string;
}

export interface UpdateChannelMembersS2CEvent extends GatewayEvent {
  type: "UpdateChannelMembersS2CEvent";
  channelId: number;
  user: User;
  action: string;
}

export interface CreateMessageS2CEvent extends GatewayEvent {
  type: "CreateMessageS2CEvent";
  channelId: number;
  message: Message;
}

export interface DeleteMessageS2CEvent extends GatewayEvent {
  type: "DeleteMessageS2CEvent";
  channelId: number;
  messageId: number;
}

export interface UpdateMessageContentS2CEvent extends GatewayEvent {
  type: "UpdateMessageContentS2CEvent";
  channelId: number;
  messageId: number;
  content: string;
}
