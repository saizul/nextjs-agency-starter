import { describe, expect, it } from "vitest";
import { buildSignatureHeaders, signPayload, verifySignature } from "./hmac";

const EXPECTED = "91b5374b153842ad05b2c4eab9349b8321b14703165bd3fb8b034dfb8be98ae5";
const secret = "test-secret";
const body = JSON.stringify({ hello: "world" });

describe("hmac signing", () => {
  it("is deterministic", () => {
    expect(signPayload(body, secret, 1700000000)).toBe(signPayload(body, secret, 1700000000));
  });

  it("matches the RFC-style HMAC-SHA256 output for a fixed input", () => {
    // HMAC-SHA256("key", "1.body"), computed independently with openssl.
    expect(signPayload("body", "key", "1")).toBe(EXPECTED);
  });

  it("changes when body, secret or timestamp change", () => {
    const base = signPayload(body, secret, 1);
    expect(signPayload(body + " ", secret, 1)).not.toBe(base);
    expect(signPayload(body, "other", 1)).not.toBe(base);
    expect(signPayload(body, secret, 2)).not.toBe(base);
  });

  it("builds prefixed headers with second-resolution timestamps", () => {
    const headers = buildSignatureHeaders(body, secret, 1_700_000_000_999);
    expect(headers["X-Timestamp"]).toBe("1700000000");
    expect(headers["X-Signature"]).toMatch(/^sha256=[0-9a-f]{64}$/);
  });

  it("verifies a valid signature", () => {
    const now = 1_700_000_000_000;
    const headers = buildSignatureHeaders(body, secret, now);
    expect(
      verifySignature(body, secret, headers["X-Signature"]!, headers["X-Timestamp"]!, { now }),
    ).toBe(true);
  });

  it("rejects a tampered body", () => {
    const now = 1_700_000_000_000;
    const headers = buildSignatureHeaders(body, secret, now);
    expect(
      verifySignature(body + "x", secret, headers["X-Signature"]!, headers["X-Timestamp"]!, {
        now,
      }),
    ).toBe(false);
  });

  it("rejects the wrong secret and malformed headers", () => {
    const now = 1_700_000_000_000;
    const headers = buildSignatureHeaders(body, secret, now);
    expect(
      verifySignature(body, "nope", headers["X-Signature"]!, headers["X-Timestamp"]!, { now }),
    ).toBe(false);
    expect(verifySignature(body, secret, "abc", headers["X-Timestamp"]!, { now })).toBe(false);
    expect(verifySignature(body, secret, "sha256=zz", headers["X-Timestamp"]!, { now })).toBe(
      false,
    );
  });

  it("rejects stale timestamps", () => {
    const sentAt = 1_700_000_000_000;
    const headers = buildSignatureHeaders(body, secret, sentAt);
    const later = sentAt + 10 * 60 * 1000;
    expect(
      verifySignature(body, secret, headers["X-Signature"]!, headers["X-Timestamp"]!, {
        now: later,
      }),
    ).toBe(false);
    expect(
      verifySignature(body, secret, headers["X-Signature"]!, headers["X-Timestamp"]!, {
        now: later,
        toleranceSeconds: 3600,
      }),
    ).toBe(true);
  });
});
