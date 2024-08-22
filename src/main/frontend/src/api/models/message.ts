import { Channel } from "./Channel";
import { User } from "./User";

export interface Message {
  type: MessageTypeEnum;
  timestamp: Date;
  content: string;
  channel: Channel;
  user?: User;
  id?: number;
}

export enum MessageTypeEnum {
  Message,
  Post,
}
