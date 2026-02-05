import type { KickAuthOptions } from "./auth";

/**
 * Available OAuth2 scopes for Kick API.
 * @type {string}
 */
type KickScopes =
  | "user:read"
  | "channel:read"
  | "channel:write"
  | "channel:rewards:read"
  | "channel:rewards:write"
  | "chat:write"
  | "streamkey:read"
  | "events:subscribe"
  | "moderation:ban"
  | "moderation:chat_message:manage"
  | "kicks:read";

/**
 * Options for initializing the KickClient.
 *
 * - `clientId`: The client ID of your Kick application.
 * - `clientSecret`: The client secret of your Kick application.
 * - `redirectUri`: The redirect URI for OAuth2 authorization.
 * - `scopes`: The scopes required for your application.
 * - `state`: Optional state parameter for OAuth2 authorization.
 * - `auth`: Authentication options including token management.
 *
 * @example
 * ```ts
 * const client = new KickClient({
 *   clientId: "your-client-id",
 *   clientSecret: "your-client-secret",
 *   redirectUri: "http://localhost:3000/callback",
 *   scopes: ["chat:read", "chat:write"],
 *   auth: {
 *     initialTokens: {
 *       access_token: "initial-access-token",
 *       refresh_token: "initial-refresh-token",
 *       expires_in: 7200,
 *       scope: "chat:read chat:write",
 *       token_type: "Bearer",
 *     },
 *   },
 *   onTokenUpdate: (tokens) => {
 *      console.log("Tokens updated:", tokens);
 *   }
 * });
 * ```
 *
 * @interface KickClientOptions
 * @property {string} clientId - The client ID of your Kick application.
 * @property {string} clientSecret - The client secret of your Kick application.
 * @property {string} redirectUri - The redirect URI for OAuth2 authorization.
 * @property {KickScopes[]} scopes - The scopes required for your application.
 * @property {string} [state] - Optional state parameter for OAuth2 authorization.
 * @property {KickAuthOptions} [auth] - Authentication options including token management.
 */
export interface KickClientOptions {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: KickScopes[];
  state?: string;
  auth?: KickAuthOptions;
}
