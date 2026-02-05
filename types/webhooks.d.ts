export interface KickWebhookEvent<T = any> {
  event: string;
  data: T;
  created_at: string;
}

export interface ChatMessageEvent {
  message_id: string;
  replies_to: string | null;
  broadcaster: {
    is_anonymous: boolean;
    user_id: number;
    username: string;
    is_verified: boolean;
    profile_picture: string;
    channel_slug: string;
    identity: any | null;
  };
  sender: {
    is_anonymous: boolean;
    user_id: number;
    username: string;
    is_verified: boolean;
    profile_picture: string;
    channel_slug: string;
    identity: any | null;
  };
  content: string;
  emotes: any[];
  created_at: string;
}
export interface CreateServerOptions {
  port?: number;
  path?: string;
}
