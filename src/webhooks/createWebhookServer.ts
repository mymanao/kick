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
    if (req.method !== "POST" || req.url !== path) {
      res.statusCode = 404;
      res.end();
      return;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString("utf8");

    try {
      await router.handleRequest({
        rawBody,
        headers: req.headers as Record<string, string>,
      });

      res.statusCode = 200;
      res.end();
    } catch (err) {
      res.statusCode = 401;
      res.end();
    }
  });

  server.listen(port, () => {
    console.log(
      `Kick webhook server listening on http://localhost:${port}${path}`
    );
    console.log(
      "Expose this endpoint publicly and register it in the Kick dashboard."
    );
  });

  return server;
}
