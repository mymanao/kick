import type { CreateServerOptions } from "../../types";
import { webhookServer } from "./WebhookServer.ts";
import { ngrokAdapter } from "./NgrokAdapter.ts";

const KICK_PUBLIC_KEY_PEM = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq/+l1WnlRrGSolDMA+A8
6rAhMbQGmQ2SapVcGM3zq8ANXjnhDWocMqfWcTd95btDydITa10kDvHzw9WQOqp2
MZI7ZyrfzJuz5nhTPCiJwTwnEtWft7nV14BYRDHvlfqPUaZ+1KR4OCaO/wWIk/rQ
L/TjY0M70gse8rlBkbo2a8rKhu69RQTRsoaf4DVhDPEeSeI5jVrRDGAMGL3cGuyY
6CLKGdjVEM78g3JfYOvDU/RvfqD7L89TZ3iN94jrmWdGz34JNlEI5hqK8dd7C5EF
BEbZ5jgB8s8ReQV8H+MkuffjdAj3ajDDX3DOJMIut1lBrUVD1AaSrGCKHooWoL2e
twIDAQAB
-----END PUBLIC KEY-----
`.trim();

export async function verifyKickWebhookSignature(params: {
  messageId: string;
  timestamp: string;
  rawBody: string;
  signature: string;
}): Promise<boolean> {
  const { messageId, timestamp, rawBody, signature } = params;
  const payload = `${messageId}.${timestamp}.${rawBody}`;

  const pemContents = KICK_PUBLIC_KEY_PEM.replace(
    "-----BEGIN PUBLIC KEY-----",
    "",
  )
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s+/g, "");

  const binaryKey = Buffer.from(pemContents, "base64");

  const publicKey = await crypto.subtle.importKey(
    "spki",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const sigBuffer = Buffer.from(signature, "base64");

  return await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    sigBuffer,
    data,
  );
}

type Handler = (event: any, headers: Headers) => void | Promise<void>;

export class WebhookRouter {
  private handlers = new Map<string, Set<Handler>>();

  constructor(
    private readonly secret: string,
    private readonly rest: any,
  ) {}

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

    const valid = await verifyKickWebhookSignature({
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
    return webhookServer(this, options);
  }

  async ngrok(options?: {
    port?: number;
    path?: string;
    authtoken?: string;
    domain?: string;
    region?: string;
    onUrl?: (url: string) => void;
  }) {
    return await ngrokAdapter(options);
  }

  async subscribe(options: { events: { name: string; version?: number }[] }) {
    await this.rest.fetch("/public/v1/events/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        events: options.events.map((e) => ({
          name: e.name,
          version: e.version ?? 1,
        })),
        method: "webhook",
      }),
    });
  }
}
