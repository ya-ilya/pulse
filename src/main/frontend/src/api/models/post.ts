import { Channel } from './Channel';

export interface Post {
    timestamp: Date;
    content: string;
    channel: Channel;
    id?: number;
}
