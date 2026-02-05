import { callbackServer } from "./CallbackServer.ts";
import type { KickClient } from "../KickClient";

type AuthorizedHandler = () => void | Promise<void>;

/**
 * AuthManager handles authentication lifecycle events and local callback servers.
 * @example
 * ```ts
 * kick.auth.onAuthorized(() => {
 *   console.log("Authenticated and ready!");
 * });
 * ```
 */
export class AuthManager {
  private handlers = new Set<AuthorizedHandler>();
  private readonly client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  /**
   * Register a callback to be executed when the client is authorized.
   * @param handler Function to run on authorization
   */
  onAuthorized(handler: AuthorizedHandler) {
    this.handlers.add(handler);
  }

  /**
   * Trigger all registered authorization handlers.
   * Internal use only.
   */
  async emitAuthorized() {
    for (const handler of this.handlers) {
      await handler();
    }
  }

  /**
   * Returns a promise that resolves once the client is authorized.
   * @example
   * await kick.auth.waitForAuthorization();
   * console.log("Authorized!");
   */
  waitForAuthorization(): Promise<void> {
    return new Promise((resolve) => {
      this.onAuthorized(() => resolve());
    });
  }

  /**
   * Creates a temporary local server to handle OAuth2 redirects.
   * @param options Server configuration
   * @returns {Bun.Server<undefined>} Callback server instance
   */
  createCallbackServer(options?: {
    port?: number;
    path?: string;
  }): Bun.Server<undefined> {
    return callbackServer(this.client, options);
  }
}
