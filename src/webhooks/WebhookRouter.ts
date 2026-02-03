import {verifyKickWebhookSignature} from "./verifyKickWebhook";
import type {CreateServerOptions} from "../../types";
import {createWebhookServer} from "./createWebhookServer.ts";
import {startNgrok} from "./ngrok";

type Handler = (event: any, headers: Headers) => void | Promise<void>;

export class WebhookRouter {
  private handlers = new Map<string, Set<Handler>>();
  private callbackUrl?: string;

  constructor(
    private readonly secret: string,
    private readonly rest: any
  ) {}

  setCallbackUrl(url: string) {
    this.callbackUrl = url;
  }

  on(eventType: string, handler: Handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  async handleRequest(params: {
    rawBody: string;
    headers: Record<string, string | string[] | undefined>;
  }) {
    const headers = params.headers;

    const messageId = headers["kick-event-message-id"] as string;
    const timestamp = headers["kick-event-message-timestamp"] as string;
    const signature = headers["kick-event-signature"] as string;
    const eventType = headers["kick-event-type"] as string;

    if (!messageId || !timestamp || !signature || !eventType) {
      throw new Error("Missing required Kick webhook headers");
    }

    const valid = verifyKickWebhookSignature({
      messageId,
      timestamp,
      rawBody: params.rawBody,
      signature,
    });

    if (!valid) {
      throw new Error("Invalid Kick webhook signature");
    }

    const payload = JSON.parse(params.rawBody);

    const handlers = this.handlers.get(eventType);
    if (!handlers) return;

    for (const handler of handlers) {
      await handler(payload, headers as any);
    }
  }

  createServer(options: CreateServerOptions) {
    return createWebhookServer(this, options);
  }

  async ngrok(options?: {
    port?: number;
    path?: string;
    authtoken?: string;
    domain?: string;
    region?: string;
    onUrl?: (url: string) => void;
  }) {
    const result = await startNgrok(options);
    this.setCallbackUrl(result.url);
    return result;
  }

  async subscribe(options: {
    events: { name: string; version?: number }[];
  }) {
    await this.rest.fetch("/public/v1/events/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        events: options.events.map(e => ({
          name: e.name,
          version: e.version ?? 1,
        })),
        method: "webhook",
      }),
    });
  }


}
