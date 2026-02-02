import { KickClient } from "../src/KickClient";

const kick = new KickClient({
  clientId: process.env.KICK_CLIENT_ID!,
  clientSecret: process.env.KICK_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/callback",
  scopes: ["chat:write"],
});

kick.webhooks.on("chat.message.sent", async (event) => {
  if (event.data.content === "!ping") {
    await kick.chat.send({ content: "pong 🏓" });
  }
});

kick.webhooks.createServer({
  port: 3000,
  path: "/kick/webhook",
});
