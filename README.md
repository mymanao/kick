# Kick SDK

A **minimal, server-side JavaScript/TypeScript SDK** for building Kick bots using the **official Kick Dev API**.

This SDK focuses on:
- OAuth 2.1 (PKCE + client secret)
- Automatic token refresh
- Chat message sending
- Webhook-based event handling (RSA-verified)
- Low boilerplate, no framework lock-in

---

## Features

- OAuth 2.1 authorization (User Access Tokens)
- Automatic access token refresh
- Send chat messages as a bot
- Receive chat events via Kick webhooks
- RSA public-key webhook verification (official spec)
- Built-in helpers to start OAuth callback and webhook servers
- Works with Node.js 18+ (TypeScript or JavaScript)

---

## Requirements

- Node.js **18+**
- A Kick developer application
- A **server-side environment** (this SDK is not browser-only)
- A publicly reachable HTTPS URL for webhooks (ngrok, tunnel, or server)

---

## Installation

```bash
npm install @narzeky/kick
```

---

## Create a Kick App

1. Go to the Kick developer dashboard
2. Create a new application
3. Note your **Client ID** and **Client Secret**
4. Set a redirect URL (e.g. `http://localhost:3000/callback`)
5. Enable required scopes (e.g. `chat:write`)
6. Configure webhook subscriptions for events you want (e.g. `chat.message.sent`)

---

## Quick Start: Simple Bot

### Full example

```ts
import { KickClient } from "@narzeky/kick";

const kick = new KickClient({
  clientId: process.env.KICK_CLIENT_ID!,
  clientSecret: process.env.KICK_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/callback",
  scopes: ["chat:write"],
});

console.log(kick.getAuthURL());

kick.auth.onAuthorized(async () => {
  await kick.chat.send({ content: "Bot online 👋" });
});

kick.webhooks.on("chat.message.sent", async (event) => {
  if (event.data.content === "!ping") {
    await kick.chat.send({ content: "pong 🏓" });
  }
});

kick.auth.createCallbackServer({ port: 3000 });
kick.webhooks.createServer({ port: 3000 });
```

---

## OAuth Flow

1. Run your app
2. Open the printed authorization URL in your browser
3. Approve access on Kick
4. Kick redirects to your callback URL
5. Tokens are exchanged and stored in memory
6. `onAuthorized` handlers are triggered

Tokens are refreshed automatically when needed.

> **Note**  
> For production use, you should persist tokens (database, file, KV store) and restore them on startup.

---

## Webhooks

Kick delivers events via HTTPS webhooks.

This SDK:
- Verifies signatures using Kick’s RSA public key
- Routes events by `Kick-Event-Type`
- Exposes a simple event-based API

Example:

```ts
kick.webhooks.on("chat.message.sent", (event) => {
  console.log(event.data.content);
});
```

### Local development

Kick cannot reach `localhost` directly.

For local testing, expose your server using a tunnel:

```bash
ngrok http 3000
```

Register the public URL in the Kick developer dashboard.

---

## Built-in Helpers

### OAuth callback server

```ts
kick.auth.createCallbackServer({
  port: 3000,
  path: "/callback",
});
```

### Webhook server

```ts
kick.webhooks.createServer({
  port: 3000,
  path: "/kick/webhook",
});
```

These helpers remove boilerplate but do not hide platform requirements.

Advanced users can integrate with their own HTTP servers using
`handleRequest()` and `exchangeCode()` directly.

---

## What This SDK Does NOT Do

- No WebSocket or IRC-style chat connections
- No DOM scraping or private APIs
- No browser-only support
- No automatic tunnel creation
- No moderation helpers (yet)

This SDK follows **Kick’s official API model**.

---

## Supported Events

Event names depend on what you subscribe to in the Kick dashboard, for example:

- `chat.message.sent`
- `channel.followed`
- `stream.started`

Events are passed through as-is from Kick.

---

## Project Status

- API coverage: **basic / bot-ready**
- Stability: **usable for real bots**
- Scope: intentionally small

This project is designed to be a clean foundation, not a monolithic framework.

---

## License

MIT

---

## Disclaimer

This is an **unofficial** SDK and is not affiliated with or endorsed by Kick.

Kick’s API and webhook formats may change; breaking changes will be addressed as needed.
