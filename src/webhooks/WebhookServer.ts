import type { WebhookRouter } from "./WebhookRouter";
import type { CreateServerOptions } from "../../types";
import { logger } from "../Logger.ts";

export function webhookServer(
  router: WebhookRouter,
  options: CreateServerOptions = {},
): Bun.Server<undefined> {
  const port = options.port ?? 3000;
  const path = options.path ?? "/kick/webhook";

  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      if (req.method !== "POST" || url.pathname !== path) {
        return new Response(null, { status: 404 });
      }

      try {
        const rawBody = await req.text();
        const headers = Object.fromEntries(req.headers.entries());

        await router.handleRequest({
          rawBody,
          headers,
        });

        return new Response("OK", { status: 200 });
      } catch (err) {
        logger.error(err);
        return new Response("Unauthorized", { status: 401 });
      }
    },
  });

  logger.success("Webhook server started", { port, path });

  return server;
}
