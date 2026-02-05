import type { KickClient } from "../KickClient";
import { logger } from "../Logger.ts";

/**
 * Configuration options for the local callback server.
 */
interface CallbackServerOptions {
  /** @default 3000 */
  port?: number;
  /** @default "/callback" */
  path?: string;
}

export function callbackServer(
  client: KickClient,
  options: CallbackServerOptions = {},
): Bun.Server<undefined> {
  const port = options.port ?? 3000;
  const path = options.path ?? "/callback";

  const server = Bun.serve({
    port,
    reusePort: true,
    async fetch(req) {
      const url = new URL(req.url);

      if (req.method !== "GET" || url.pathname !== path) {
        return new Response(null, { status: 404 });
      }

      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");

      if (!code || state !== client.getState()) {
        logger.error("Invalid OAuth callback: state mismatch or missing code");
        return new Response("Invalid OAuth callback", { status: 400 });
      }

      try {
        await client.exchangeCode(code);
        await client.auth.emitAuthorized();

        return new Response("Authorization success, you can close this tab.", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      } catch (err) {
        logger.error("OAuth exchange failed", err);
        return new Response("Authorization failed", { status: 500 });
      }
    },
  });

  logger.success("Callback server started", { port, path });

  return server;
}
