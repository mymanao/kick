/**
 * Example 08: Basic Chat Bot Template
 *
 * This template will help you set up a basic chat bot using the ManaoKick library.
 * The bot will listen for incoming chat messages and can be extended to respond or moderate.
 * In the first run, it will print the access and refresh tokens to the console for
 * you to save in your environment variables file (.env).
 *
 * Before running this code, ensure you have the following environment variables set:
 * - KICK_CLIENT_ID
 * - KICK_CLIENT_SECRET
 *
 *  SCOPES ["chat:write", "events:subscribe", "moderation:ban", "channel:read"]
 *  Make sure to refresh the tokens and update your environment variables when scopes change.
 */

import { KickClient } from "../../src/KickClient.ts";
import type { ChatMessageEvent, KickTokenResponse } from "../../types";

const PREFIX = "!";

// Initialize the KickClient
const kick = new KickClient({
  clientId: Bun.env.KICK_CLIENT_ID!,
  clientSecret: Bun.env.KICK_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/callback",
  scopes: ["chat:write", "events:subscribe", "moderation:ban", "channel:read"],
  showLog: false,
  auth: {
    initialTokens: Bun.env.KICK_REFRESH_TOKEN
      ? {
          access_token: Bun.env.KICK_ACCESS_TOKEN!,
          refresh_token: Bun.env.KICK_REFRESH_TOKEN!,
        }
      : undefined,
    onTokenUpdate: (tokens: KickTokenResponse) => {
      if (!Bun.env.KICK_REFRESH_TOKEN) {
        console.log("\n[!] Copy these into your .env file:\n");
        console.log(`KICK_ACCESS_TOKEN=${tokens.access_token}`);
        console.log(`KICK_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log(`\n====> Scopes granted: ${tokens.scope}`);
      }

      Bun.env.KICK_ACCESS_TOKEN = tokens.access_token;
      Bun.env.KICK_REFRESH_TOKEN = tokens.refresh_token;
    },
  },
});

// Authorization flow
if (!Bun.env.KICK_REFRESH_TOKEN) {
  console.log(`Authorize the application by visiting:\n${kick.getAuthURL()}`);
  kick.auth.createCallbackServer({ port: 3000 });
  await kick.auth.waitForAuthorization();
}

// Confirm successful authorization
console.log("\n[✔] Application authorized successfully!");

// Handle incoming chat message events
kick.webhooks.on("chat.message.sent", async (event: ChatMessageEvent) => {
  const message = event.content;
  if (message[0] !== PREFIX) return; // Ignore messages without the prefix

  const args = message.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift()!.toLowerCase();

  switch (command) {
    case "ping":
      await kick.chat.send({ content: "pong 🏓" });
      break;
    case "love":
      const loveTarget = args.join(" ") || event.sender.username;
      const lovePercentage = Math.floor(Math.random() * 101);
      await kick.chat.send({
        content: `${event.sender.username} ❤️ ${loveTarget}: ${lovePercentage}%!`,
      });
      break;
    default:
      return;
  }
});

// Set up ngrok to expose the webhook endpoint
const { url, close } = await kick.webhooks.ngrok({
  port: 5000, // Use the same port as the webhook server
  path: "/kick/webhook",
  domain: "topical-goshawk-leading.ngrok-free.app", // <==== Replace with YOUR OWN ngrok domain!
  authtoken: Bun.env.NGROK_AUTHTOKEN,
});

console.log(`[✔] ngrok tunnel established at: ${url}`);

// Create a webhook server to listen for incoming events
kick.webhooks.createServer({ port: 5000, path: "/kick/webhook" }); // Use port that ngrok will forward to

// Subscribe to webhooks once authorized
kick.auth.onAuthorized(async () => {
  await kick.webhooks.subscribe({
    events: [{ name: "chat.message.sent" }],
  });
});
