import type { KickTokenResponse } from "../../types";

export async function exchangeCode(
  code: string,
  verifier: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<KickTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
    code_verifier: verifier,
  });

  const res = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(`Code exchange failed (${res.status})`);
  }

  return res.json() as Promise<KickTokenResponse>;
}

export async function refreshToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<KickTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed (${res.status})`);
  }

  return res.json() as Promise<KickTokenResponse>;
}
