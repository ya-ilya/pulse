import { User } from "./User";

export interface Message {
  type: MessageType;
  timestamp: string;
  content: string;
  user?: User;
  id?: number;
}

export enum MessageType {
  Message,
  Post,

  // This is a client-side message type
  Date,
}
