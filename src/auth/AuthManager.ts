import { createCallbackServer } from "./createCallbackServer";
import type { KickClient } from "../KickClient";

type AuthorizedHandler = () => void | Promise<void>;

export class AuthManager {
  private handlers = new Set<AuthorizedHandler>();
  private client: KickClient;

  constructor(client: KickClient) {
    this.client = client;
  }

  onAuthorized(handler: AuthorizedHandler) {
    this.handlers.add(handler);
  }

  async emitAuthorized() {
    for (const handler of this.handlers) {
      await handler();
    }
  }

  createCallbackServer(options?: { port?: number; path?: string }) {
    return createCallbackServer(this.client, options);
  }
}
