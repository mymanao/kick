import crypto from "node:crypto";

const KICK_PUBLIC_KEY_PEM = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq/+l1WnlRrGSolDMA+A8
6rAhMbQGmQ2SapVcGM3zq8ANXjnhDWocMqfWcTd95btDydITa10kDvHzw9WQOqp2
MZI7ZyrfzJuz5nhTPCiJwTwnEtWft7nV14BYRDHvlfqPUaZ+1KR4OCaO/wWIk/rQ
L/TjY0M70gse8rlBkbo2a8rKhu69RQTRsoaf4DVhDPEeSeI5jVrRDGAMGL3cGuyY
6CLKGdjVEM78g3JfYOvDU/RvfqD7L89TZ3iN94jrmWdGz34JNlEI5hqK8dd7C5EF
BEbZ5jgB8s8ReQV8H+MkuffjdAj3ajDDX3DOJMIut1lBrUVD1AaSrGCKHooWoL2e
twIDAQAB
-----END PUBLIC KEY-----
`.trim();

export function verifyKickWebhookSignature(params: {
  messageId: string;
  timestamp: string;
  rawBody: string;
  signature: string; // base64
}): boolean {
  const { messageId, timestamp, rawBody, signature } = params;

  const payload = `${messageId}.${timestamp}.${rawBody}`;

  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(payload);
  verifier.end();

  const signatureBuffer = Buffer.from(signature, "base64");

  return verifier.verify(KICK_PUBLIC_KEY_PEM, signatureBuffer);
}
