import { Channel } from './Channel';
import { User } from './User';

export interface Message {
    timestamp: Date;
    content: string;
    channel: Channel;
    user: User;
    id?: number;
}
