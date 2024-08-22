import { User } from "./User";

export interface Channel {
  type?: ChannelTypeEnum;
  name?: string;
  admin?: User;
  id?: number;
}

export enum ChannelTypeEnum {
  Channel = "Channel",
  PrivateChat = "PrivateChat",
  GroupChat = "GroupChat",
  CommentsChat = "CommentsChat",
}
