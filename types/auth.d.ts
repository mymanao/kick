/**
 * Represents the response received when getting or refreshing tokens from Kick.
 *
 * - `access_token`: The access token used for authentication.
 * - `refresh_token`: The refresh token used to obtain new access tokens.
 * - `token_type`: (Optional) The type of the token, typically "Bearer".
 * - `expires_in`: (Optional) The duration in seconds until the access token expires.
 * - `scope`: (Optional) The scopes granted to the access token.
 *
 * @interface KickTokenResponse
 * @property {string} access_token - The access token used for authentication.
 * @property {string} refresh_token - The refresh token used to obtain new access tokens.
 * @property {string} [token_type] - (Optional) The type of the token, typically "Bearer".
 * @property {number} [expires_in] - (Optional) The duration in seconds until the access token expires.
 * @property {number} [expires_at] - (Optional) The timestamp (in milliseconds) when the access token expires.
 * @property {string} [scope] - (Optional) The scopes granted to the access token.
 */
export interface KickTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
  expires_at?: number;
  scope?: string;
}

/**
 * Options for Kick authentication including initial tokens and token update callback.
 *
 * - `initialTokens`: (Optional) Initial tokens to set up the authentication.
 * - `onTokenUpdate`: (Optional) Callback function invoked when tokens are updated.
 *
 * @interface KickAuthOptions
 * @property {KickTokenResponse} [initialTokens] - (Optional) Initial tokens to set up the authentication.
 * @property {(tokens: KickTokenResponse) => void | Promise<void>} [onTokenUpdate] - (Optional) Callback function invoked when tokens are updated.
 */
export interface KickAuthOptions {
  initialTokens?: KickTokenResponse;
  onTokenUpdate?: (tokens: KickTokenResponse) => void | Promise<void>;
}
