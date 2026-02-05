import { RestClient } from "./rest/RestClient";
import { createPkce } from "./auth/PKCE.ts";
import * as OAuth from "./auth/OAuth.ts";
import { ChatClient } from "./chat/ChatClient.ts";
import type { KickClientOptions, KickTokenResponse } from "../types";
import { TokenManager } from "./auth/TokenManager.ts";
import { WebhookRouter } from "./webhooks/WebhookRouter.ts";
import { AuthManager } from "./auth/AuthManager.ts";
import { callbackServer } from "./auth/CallbackServer.ts";
import { silent } from "./Logger.ts";
import { CategoriesAPI } from "./api/CategoriesAPI.ts";
import { UsersAPI } from "./api/UsersAPI.ts";
import { ChannelsAPI } from "./api/ChannelsAPI.ts";
import { ChannelRewardsAPI } from "./api/ChannelRewardsAPI.ts";
import { LivestreamsAPI } from "./api/LivestreamsAPI.ts";
import { ModerationAPI } from "./api/ModerationAPI.ts";
import { KicksAPI } from "./api/KicksAPI.ts";

/**
 * The primary entry point for interacting with the Kick API.
 * @example
 * const kick = new KickClient({
 *   clientId: Bun.env.KICK_CLIENT_ID!,
 *   clientSecret: Bun.env.KICK_CLIENT_SECRET!,
 *   redirectUri: "http://localhost:3000/callback",
 *   scopes: ["chat:write", "events:subscribe"],
 *   showLog: false,
 *   auth: {
 *     initialTokens: {
 *       access_token: Bun.env.KICK_ACCESS_TOKEN!,
 *       refresh_token: Bun.env.KICK_REFRESH_TOKEN!,
 *     },
 *     onTokenUpdate: (tokens: KickTokenResponse) => {*
 *       Bun.env.KICK_ACCESS_TOKEN = tokens.access_token;
 *       Bun.env.KICK_REFRESH_TOKEN = tokens.refresh_token;
 *     },
 *   },
 * }); */
export class KickClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes: string[];
  private readonly state: string;
  private pkceVerifier?: string;
  private readonly tokenManager: TokenManager;
  private rest = new RestClient();

  public chat = new ChatClient(this.rest);
  public webhooks: WebhookRouter;
  public auth: AuthManager;
  public readonly api: {
    categories: CategoriesAPI;
    users: UsersAPI;
    channels: ChannelsAPI;
    rewards: ChannelRewardsAPI;
    livestreams: LivestreamsAPI;
    moderation: ModerationAPI;
    kicks: KicksAPI;
  };

  constructor(
    options: KickClientOptions & { webhookSecret?: string; showLog?: boolean },
  ) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.redirectUri = options.redirectUri;
    this.scopes = options.scopes;
    this.state =
      options.state ??
      Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("hex");

    this.webhooks = new WebhookRouter(options.clientSecret, this.rest);

    this.auth = new AuthManager(this);

    this.tokenManager = new TokenManager(
      (refreshToken) =>
        OAuth.refreshToken(refreshToken, this.clientId, this.clientSecret),
      options.auth?.onTokenUpdate,
    );

    this.api = {
      categories: new CategoriesAPI(this.rest),
      users: new UsersAPI(this.rest),
      channels: new ChannelsAPI(this.rest),
      rewards: new ChannelRewardsAPI(this.rest),
      livestreams: new LivestreamsAPI(this.rest),
      moderation: new ModerationAPI(this.rest),
      kicks: new KicksAPI(this.rest),
    };

    if (options.auth?.initialTokens) {
      this.tokenManager.setTokens(options.auth.initialTokens);
      this.rest.setTokenManager(this.tokenManager);
    }

    if (!options.showLog) {
      silent();
    }
  }

  /**
   * Generates the OAuth authorization URL and initializes PKCE verification.
   * @returns The Kick authorization URL
   */
  getAuthURL(): string {
    const { verifier, challenge } = createPkce();
    this.pkceVerifier = verifier;

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(" "),
      state: this.state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    return `https://id.kick.com/oauth/authorize?${params}`;
  }

  /**
   * Returns the current anti-forgery state string.
   */
  getState(): string {
    return this.state;
  }

  /**
   * Exchanges an authorization code for access and refresh tokens.
   * @param code The code received from the OAuth callback
   * @returns Kick token response
   */
  async exchangeCode(code: string): Promise<KickTokenResponse> {
    if (!this.pkceVerifier) {
      throw new Error("PKCE verifier missing");
    }

    const token = await OAuth.exchangeCode(
      code,
      this.pkceVerifier,
      this.clientId,
      this.clientSecret,
      this.redirectUri,
    );

    this.tokenManager.setTokens(token);
    this.rest.setTokenManager(this.tokenManager);

    return token;
  }

  /**
   * Manually refreshes the access token using a refresh token.
   * @param refreshToken The refresh token to use
   * @returns New Kick token response
   */
  async refreshToken(refreshToken: string): Promise<KickTokenResponse> {
    return OAuth.refreshToken(refreshToken, this.clientId, this.clientSecret);
  }

  /**
   * Starts a local server to handle the OAuth redirect and token exchange.
   * @param options Server configuration options
   * @returns The running Bun server instance
   */
  createAuthCallbackServer(options?: { port?: number; path?: string }) {
    return callbackServer(this, options);
  }
}
