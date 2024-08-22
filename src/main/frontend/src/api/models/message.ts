import { Channel } from "./Channel";
import { User } from "./User";

export interface Message {
  type: MessageType;
  timestamp: Date;
  content: string;
  channel: Channel;
  user?: User;
  id?: number;
}

export enum MessageType {
  Message,
  Post,
}
