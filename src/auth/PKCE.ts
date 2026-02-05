export function createPkce(): {
  verifier: string;
  challenge: string;
} {
  const verifier = Buffer.from(
    crypto.getRandomValues(new Uint8Array(32)),
  ).toString("base64url");
  const challenge = new Bun.CryptoHasher("sha256")
    .update(verifier)
    .digest("base64url");

  return { verifier, challenge };
}
