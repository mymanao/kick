import http from "node:http";
import { URL } from "node:url";
import type { KickClient } from "../KickClient";

interface CallbackServerOptions {
  port?: number;
  path?: string;
}

export function createCallbackServer(
  client: KickClient,
  options: CallbackServerOptions = {}
) {
  const port = options.port ?? 3000;
  const path = options.path ?? "/callback";

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "", `http://localhost:${port}`);

    if (req.method !== "GET" || url.pathname !== path) {
      res.statusCode = 404;
      res.end();
      return;
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || state !== client.getState()) {
      res.statusCode = 400;
      res.end("Invalid OAuth callback");
      return;
    }

    try {
      await client.exchangeCode(code);
      await client.auth.emitAuthorized();

      res.statusCode = 200;
      res.end("Authorization successful");
    } catch (err) {
      res.statusCode = 500;
      res.end("Authorization failed");
    }
  });

  server.listen(port, () => {
    console.log(
      `Kick OAuth callback listening on http://localhost:${port}${path}`
    );
    console.log("Complete authorization in your browser.");
  });

  return server;
}
