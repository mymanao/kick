import { KickClient } from "../src/KickClient";

const kick = new KickClient({
  clientId: process.env.KICK_CLIENT_ID!,
  clientSecret: process.env.KICK_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/callback",
  scopes: ["chat:write"],
});

console.log(kick.getAuthURL());

kick.auth.onAuthorized(async () => {
  await kick.chat.send({ content: "Hello Kick chat! 👋" });
});

kick.auth.createCallbackServer({ port: 3000 });
