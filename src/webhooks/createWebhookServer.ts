import http from "node:http";
import type {WebhookRouter} from "./WebhookRouter";
import type {CreateServerOptions} from "../../types";

export function createWebhookServer(
  router: WebhookRouter,
  options: CreateServerOptions = {}
) {
  const port = options.port ?? 3000;
  const path = options.path ?? "/kick/webhook";

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);

    if (req.method !== "POST" || url.pathname !== path) {
      res.statusCode = 404;
      res.end();
      return;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString("utf8");

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        headers[key] = value;
      }
    }

    try {
      await router.handleRequest({
        rawBody,
        headers,
      });

      res.statusCode = 200;
      res.end();
    } catch (err) {
      console.error("Webhook error:", err);
      res.statusCode = 401;
      res.end();
    }
  });

  server.listen(port, () => {
    console.log(
      `Kick webhook server listening on http://localhost:${port}${path}`
    );
  });

  return server;
}
