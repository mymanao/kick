export interface KickClientOptions {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  state?: string;
}
