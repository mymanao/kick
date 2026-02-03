import { KickClient } from "../src/KickClient";

const kick = new KickClient({
  clientId: Bun.env.KICK_CLIENT_ID!,
  clientSecret: Bun.env.KICK_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/callback",
  scopes: ["chat:write", "events:subscribe"],
  auth: {
    initialTokens: Bun.env.KICK_REFRESH_TOKEN
      ? {
        access_token: Bun.env.KICK_ACCESS_TOKEN!,
        refresh_token: Bun.env.KICK_REFRESH_TOKEN!,
        expires_in: Number(Bun.env.KICK_EXPIRES_IN!),
        scope: Bun.env.KICK_SCOPE!,
        token_type: Bun.env.KICK_TOKEN_TYPE!,
      }
      : undefined,
  },
});

kick.webhooks.on("chat.message.sent", async (event) => {
  console.log("EVENT:", event.content);
  if (event.content === "!ping") {
    await kick.chat.send({ content: "pong 🏓" });
  }
});

if (!Bun.env.KICK_REFRESH_TOKEN) {
  console.log(kick.getAuthURL());
  kick.auth.createCallbackServer({ port: 3000, path: "/callback" });
}

await kick.webhooks.ngrok({
  port: 5000,
  path: "/kick/webhook",
  domain: "topical-goshawk-leading.ngrok-free.app",
  authtoken: Bun.env.NGROK_AUTHTOKEN,
});

kick.webhooks.createServer({ port: 5000, path: "/kick/webhook" });

await kick.webhooks.subscribe({
  events: [{ name: "chat.message.sent" }],
});

console.log("Bot ready");
