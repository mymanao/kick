export interface KickTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface KickAuthOptions {
  initialTokens?: KickTokenResponse;
  onTokenUpdate?: (tokens: KickTokenResponse) => void | Promise<void>;
}