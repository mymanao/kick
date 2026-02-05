/**
 * Example 05: Using Users API
 *
 * This template demonstrates how to use the Users API of the ManaoKick library.
 * The bot will fetch and display user data once authorized.
 * In the first run, it will print the access and refresh tokens to the console for
 * you to save in your environment variables file (.env).
 *
 * Before running this code, ensure you have the following environment variables set:
 * - KICK_CLIENT_ID
 * - KICK_CLIENT_SECRET
 *
 * SCOPES: ["user:read"]
 * Make sure to refresh the tokens and update your environment variables when scopes change.
 */

import { KickClient } from "../../src/KickClient.ts";
import type { KickTokenResponse } from "../../types";

// Initialize the KickClient with necessary credentials and scopes
const kick = new KickClient({
  clientId: Bun.env.KICK_CLIENT_ID!,
  clientSecret: Bun.env.KICK_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/callback",
  scopes: ["user:read"],
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

const { data } = await kick.api.users.get();
console.log("\n[✔] User data fetched successfully!");
console.log(data);
