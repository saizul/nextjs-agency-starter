import { createHmac, timingSafeEqual } from "node:crypto";

export const SIGNATURE_PREFIX = "sha256=";

/** Hex HMAC-SHA256 of `${timestamp}.${body}` (the timestamp prevents trivial replays). */
export function signPayload(body: string, secret: string, timestamp: string | number): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

export function buildSignatureHeaders(
  body: string,
  secret: string,
  now: number = Date.now(),
): Record<string, string> {
  const timestamp = String(Math.floor(now / 1000));
  return {
    "X-Timestamp": timestamp,
    "X-Signature": `${SIGNATURE_PREFIX}${signPayload(body, secret, timestamp)}`,
  };
}

export interface VerifyOptions {
  /** Max accepted age of the timestamp in seconds. Default: 300. */
  toleranceSeconds?: number;
  now?: number;
}

/** Constant-time verification, useful in the receiving service and in tests. */
export function verifySignature(
  body: string,
  secret: string,
  signatureHeader: string,
  timestamp: string,
  { toleranceSeconds = 300, now = Date.now() }: VerifyOptions = {},
): boolean {
  if (!signatureHeader.startsWith(SIGNATURE_PREFIX)) return false;
  const ts = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(ts) || Math.abs(Math.floor(now / 1000) - ts) > toleranceSeconds) {
    return false;
  }
  const given = Buffer.from(signatureHeader.slice(SIGNATURE_PREFIX.length), "hex");
  const expected = Buffer.from(signPayload(body, secret, timestamp), "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
