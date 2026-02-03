import type {KickTokenResponse} from "../../types";

type RefreshFn = (refreshToken: string) => Promise<KickTokenResponse>;
type TokenUpdateCallback = (tokens: KickTokenResponse) => void | Promise<void>;

export class TokenManager {
  private accessToken?: string;
  private refreshToken?: string;
  private expiresAt?: number;
  private onUpdate?: TokenUpdateCallback;

  private readonly refreshFn: RefreshFn;
  private refreshThresholdMs = 60_000; // refresh 60s before expiry

  constructor(refreshFn: RefreshFn, onUpdate?: TokenUpdateCallback) {
    this.refreshFn = refreshFn;
    this.onUpdate = onUpdate;
  }

  setTokens(token: KickTokenResponse) {
    this.accessToken = token.access_token;
    this.refreshToken = token.refresh_token;
    this.expiresAt = Date.now() + token.expires_in * 1000;

    this.onUpdate?.(token);
  }

  async getAccessToken(): Promise<string> {
    if (!this.accessToken || !this.expiresAt) {
      throw new Error("TokenManager not initialized");
    }

    const now = Date.now();

    if (now >= this.expiresAt - this.refreshThresholdMs) {
      await this.refresh();
    }

    return this.accessToken!;
  }

  private async refresh() {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const newToken = await this.refreshFn(this.refreshToken);
    this.setTokens(newToken);
  }

  isExpired(): boolean {
    return !this.expiresAt || Date.now() >= this.expiresAt;
  }
}