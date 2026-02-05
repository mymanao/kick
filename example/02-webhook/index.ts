/**
 * Example 02: Subscribing to webhooks
 *
 * This template demonstrates how to subscribe to webhooks using the ManaoKick library.
 * The bot will respond to a specific chat message event once authorized. (!ping -> pong 🏓)
 * In the first run, it will print the access and refresh tokens to the console for
 * you to save in your environment variables file (.env).
 *
 * Before running this code, ensure you have the following environment variables set:
 * - KICK_CLIENT_ID
 * - KICK_CLIENT_SECRET
 *
 * Please note that Kick server cannot access localhost webhooks. To test webhooks,
 * consider using a tunneling service like ngrok to expose your local server to the internet.
 *
 * Simple bot template with ngrok adapter can be found in the next example: example/03-ngrok
 *
 * SCOPES: ["chat:write", "events:subscribe"]
 * Make sure to refresh the tokens and update your environment variables when scopes change.
 */

import { KickClient } from "../../src/KickClient.ts";
import type { ChatMessageEvent, KickTokenResponse } from "../../types";

// Initialize the KickClient with necessary credentials and scopes
const kick = new KickClient({
  clientId: Bun.env.KICK_CLIENT_ID!,
  clientSecret: Bun.env.KICK_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/callback",
  scopes: ["chat:write", "events:subscribe"],
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
// If no refresh token is found, initiate the authorization flow
if (!Bun.env.KICK_REFRESH_TOKEN) {
  console.log(`Authorize the application by visiting:\n${kick.getAuthURL()}`);
  kick.auth.createCallbackServer({ port: 3000 });
  await kick.auth.waitForAuthorization();
}

// Confirm successful authorization
console.log("\n[✔] Application authorized successfully!");
await kick.chat.send({
  content: "Hello from ManaoKick library!",
});

// Create a webhook server to listen for incoming events
kick.webhooks.createServer({ port: 5000, path: "/kick/webhook" });

// Subscribe to webhooks once authorized
kick.auth.onAuthorized(async () => {
  await kick.webhooks.subscribe({
    events: [{ name: "chat.message.sent" }],
  });
});

// Handle incoming chat message events
kick.webhooks.on("chat.message.sent", async (event: ChatMessageEvent) => {
  if (event.content === "!ping") {
    await kick.chat.send({ content: "pong 🏓" });
  }
});
