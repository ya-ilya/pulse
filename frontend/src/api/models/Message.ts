import { User } from "./User";

export interface Message {
  type: MessageType;
  timestamp: string;
  content: string;
  user?: User;
  id?: number;
}

export enum MessageType {
  Message = "Message",
  Post = "Post",
  Status = "Status",

  // This is a client-side message type
  Date = "Date",
}
