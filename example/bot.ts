import { KickClient } from "../src/KickClient";

const kick = new KickClient({
  clientId: Bun.env.KICK_CLIENT_ID!,
  clientSecret: Bun.env.KICK_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/callback",
  scopes: ["chat:write"],
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
    onTokenUpdate: (tokens: any) => {
      Bun.env.KICK_ACCESS_TOKEN = tokens.access_token;
      Bun.env.KICK_REFRESH_TOKEN = tokens.refresh_token;
      Bun.env.KICK_EXPIRES_IN = String(tokens.expires_in);
      Bun.env.KICK_SCOPE = tokens.scope;
      Bun.env.KICK_TOKEN_TYPE = tokens.token_type;
      console.log(`Tokens updated: ${JSON.stringify(tokens)}`);
    },
  },
});

kick.webhooks.on("chat.message.sent", async (event) => {
  console.log(event)
  if (event.data.content === "!ping") {
    await kick.chat.send({ content: "pong 🏓" });
  }
});

if (!Bun.env.KICK_REFRESH_TOKEN) {
  console.log(kick.getAuthURL());
  kick.auth.createCallbackServer({ port: 3000 });
} else {
  kick.webhooks.createServer({ port: 3000 });
}
