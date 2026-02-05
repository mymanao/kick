<p align="center">
  <a href="https://github.com/tinarskii/manao">
    <img src="https://raw.githubusercontent.com/tinarskii/manao/main/docs/manao.svg" height="64px" width="auto" />
    <h2 align="center">@manaobot/kick</h2>
  </a>
  <p align="center">
    Minimal, type-safe JavaScript SDK for building Kick.com bots.
    Designed for Bun. Works anywhere.
  </p>
  <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;">
    <img src="https://img.shields.io/npm/v/@manaobot/kick?color=00e701" alt="npm version">
    <img src="https://img.shields.io/github/license/tinarskii/manao" />
    <img src="https://img.shields.io/badge/Bun-%E2%9C%93-black?logo=bun" alt="Bun Compatible">
    <a href="https://discord.gg/vkW7YMyYaf"><img src="https://img.shields.io/discord/964718161624715304" /></a>
  </div>
</p>

---

## ⚡ About

`@manaobot/kick` is a lightweight TypeScript SDK for building Kick.com bots, tools, and automation.
This library focuses on **OAuth**, **Webhooks**, and **REST APIs**, everything required to build production-grade Kick bots.

---

## 📦 Installation

```bash
bun add @manaobot/kick
````

---

## 🚀 Quick Start

```ts
import { KickClient } from "@manaobot/kick";

const kick = new KickClient({
  clientId: process.env.KICK_CLIENT_ID!,
  clientSecret: process.env.KICK_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/callback",
  scopes: ["chat:write"],
});

if (!process.env.KICK_REFRESH_TOKEN) {
  console.log(kick.getAuthURL());
  kick.auth.createCallbackServer({ port: 3000 });
  await kick.auth.waitForAuthorization();
}

await kick.chat.send({
  content: "Hello from Kick SDK!"
});
```

---

## ✨ Features

### 🔐 Authentication

* OAuth2 Authorization Code Flow
* Automatic token refresh
* PKCE support
* Built-in callback server

---

### 🧩 Webhooks

```ts
kick.webhooks.on("chat.message.sent", (event) => {
  console.log(event.content);
});
```

* Signature verification
* ngrok integration
* Event subscription helpers

---

### 💬 Chat

```ts
await kick.chat.send({ content: "Hello chat!" });
```

---

### 🌐 REST APIs

Available via:

```ts
kick.api.*
```

Currently supported:

* Categories API
* Users API
* Channels API
* Channel Rewards API
* Moderation API
* Livestreams API
* KICKs Leaderboard API

---

## 📚 Examples

The repository includes numbered examples:

| Example                  | Description              |
| ------------------------ | ------------------------ |
| `01-authorize-bot`       | OAuth authorization      |
| `02-webhook`             | Webhook handling         |
| `03-ngrok`               | Public webhook tunneling |
| `04-categories-api`      | Categories API           |
| `05-users-api`           | Users API                |
| `06-channels-api`        | Channels API             |
| `07-channel-rewards-api` | Channel rewards          |
| `08-basic-chat-bot`      | Full bot template        |

Run examples with:

```bash
bun example/08-basic-chat-bot
```

---

## 🤝 Contributing

Pull requests are welcome.

If you want to help:

* improve typings
* add new API modules
* write examples

Join the Discord server:

[https://discord.gg/vkW7YMyYaf](https://discord.gg/vkW7YMyYaf)

---

## 📜 License

GPL-3.0 License
See LICENSE file for details.

---

## ❤️ Part of the Manao Ecosystem

This SDK powers the **ManaoBot** project:

[https://github.com/tinarskii/manao](https://github.com/tinarskii/manao)