import crypto from "node:crypto";
import {RestClient} from "./rest/RestClient";
import {createPkce} from "./auth/PKCE.ts";
import * as OAuth from "./auth/OAuth.ts";
import {ChatClient} from "./chat/ChatClient.ts";
import type {KickClientOptions, KickTokenResponse} from "../types";
import {TokenManager} from "./auth/TokenManager.ts";
import {WebhookRouter} from "./webhooks/WebhookRouter.ts";
import {AuthManager} from "./auth/AuthManager.ts";
import {createCallbackServer} from "./auth/createCallbackServer.ts";

export class KickClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes: string[];
  private readonly state: string;
  private pkceVerifier?: string;
  private tokenManager = new TokenManager(
    (refreshToken: string) => OAuth.refreshToken(refreshToken, this.clientId, this.clientSecret)
  );
  private rest = new RestClient();
  public chat = new ChatClient(this.rest);
  public webhooks: WebhookRouter;
  public auth: AuthManager;

  constructor(options: KickClientOptions & { webhookSecret?: string }) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.redirectUri = options.redirectUri;
    this.scopes = options.scopes;
    this.state = options.state ?? crypto.randomBytes(16).toString("hex");
    this.webhooks = new WebhookRouter(
      options.clientSecret,
      this.rest
    );
    this.auth = new AuthManager(this);
    this.tokenManager = new TokenManager(
      (refreshToken) => OAuth.refreshToken(refreshToken, this.clientId, this.clientSecret),
      options.auth?.onTokenUpdate
    );

    if (options.auth?.initialTokens) {
      this.tokenManager.setTokens(options.auth.initialTokens);
      this.rest.setTokenManager(this.tokenManager);
    }
  }

  getAuthURL(): string {
    const {verifier, challenge} = createPkce();
    this.pkceVerifier = verifier;

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(" "),
      state: this.state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    return `https://id.kick.com/oauth/authorize?${params}`;
  }

  getState(): string {
    return this.state;
  }

  async exchangeCode(code: string): Promise<KickTokenResponse> {
    if (!this.pkceVerifier) {
      throw new Error("PKCE verifier missing");
    }

    const token = await OAuth.exchangeCode(
      code,
      this.pkceVerifier,
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    this.tokenManager.setTokens(token);
    this.rest.setTokenManager(this.tokenManager);

    return token;
  }

  async refreshToken(refreshToken: string): Promise<KickTokenResponse> {
    return OAuth.refreshToken(refreshToken, this.clientId, this.clientSecret);
  }

  createAuthCallbackServer(options?: { port?: number; path?: string }) {
    return createCallbackServer(this, options);
  }
}