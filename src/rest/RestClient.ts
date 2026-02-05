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
    const accessToken = await this.tokenManager.getAccessToken();

    const response = await fetch(`https://api.kick.com${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      let suggestion = "";
      if (response.status === 401) {
        suggestion =
          "Have you obtained access token or refreshed them? If so, make sure your scopes cover the requested endpoint.";
      }

      throw new Error(
        `API request failed, response status: ${response.status}\n[SUGGESTION] ${suggestion}`,
      );
    }

    return response.json() as Promise<T>;
  }
}
