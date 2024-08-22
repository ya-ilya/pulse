import { User } from "./User";

export interface Channel {
  type?: ChannelType;
  name?: string;
  admin?: User;
  id?: number;
}

export enum ChannelType {
  Channel = "Channel",
  PrivateChat = "PrivateChat",
  GroupChat = "GroupChat",
  CommentsChat = "CommentsChat",
}
