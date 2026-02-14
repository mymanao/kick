import type { TokenManager } from "../auth/TokenManager.ts";

export class RestClient {
  private tokenManager?: TokenManager;

  setTokenManager(tokenManager: TokenManager) {
    this.tokenManager = tokenManager;
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.tokenManager) {
      throw new Error("TokenManager not set in RestClient");
    }

    return this.requestWithRetry<T>(endpoint, options, true);
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit,
    allowRetry: boolean,
  ): Promise<T> {
    const accessToken = await this.tokenManager!.getAccessToken();

    const response = await fetch(`https://api.kick.com${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (response.status === 401 && allowRetry) {
      await this.tokenManager!.forceRefresh();
      return this.requestWithRetry<T>(endpoint, options, false);
    }

    if (!response.ok) {
      let suggestion = "";
      if (response.status === 401) {
        suggestion =
          "Token refresh failed or scopes are insufficient for this endpoint.";
      }

      throw new Error(
        `API request failed, response status: ${response.status}\n[SUGGESTION] ${suggestion}`,
      );
    }

    return response.json() as Promise<T>;
  }
}
