export interface KickWebhookEvent<T = any> {
  event: string;
  data: T;
  created_at: string;
}

export interface ChatMessageEvent {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
  };
}
export interface CreateServerOptions {
  port?: number;
  path?: string;
}