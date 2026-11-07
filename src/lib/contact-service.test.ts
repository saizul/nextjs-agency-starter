import { describe, expect, it, vi } from "vitest";
import { defaultContactMessages } from "./contact-schema";
import { processContact, type ContactDeps } from "./contact-service";
import { verifySignature } from "./hmac";
import { createRateLimiter } from "./rate-limit";

const input = {
  name: "Jane Doe",
  email: "jane@example.com",
  message: "I would like to discuss a new website project.",
};

function deps(overrides: Partial<ContactDeps> = {}): ContactDeps {
  return {
    limiter: createRateLimiter({ limit: 2, windowMs: 60_000 }),
    webhookUrl: "https://hooks.example.test/contact",
    webhookSecret: "s3cret",
    fetchImpl: vi.fn(async () => new Response("ok", { status: 200 })) as unknown as typeof fetch,
    now: () => 1_700_000_000_000,
    ...overrides,
  };
}

const request = (formData: Record<string, string>, clientKey = "1.2.3.4") => ({
  formData,
  clientKey,
  locale: "en",
  messages: defaultContactMessages,
});

describe("processContact", () => {
  it("delivers a valid submission with a verifiable signature", async () => {
    const d = deps();
    const result = await processContact(request(input), d);
    expect(result).toEqual({ status: "success" });

    const fetchMock = d.fetchImpl as unknown as ReturnType<typeof vi.fn>;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://hooks.example.test/contact");
    const headers = init.headers as Record<string, string>;
    const body = init.body as string;
    expect(JSON.parse(body)).toMatchObject({
      name: "Jane Doe",
      locale: "en",
      source: "nextjs-agency-starter",
    });
    expect(
      verifySignature(body, "s3cret", headers["X-Signature"]!, headers["X-Timestamp"]!, {
        now: 1_700_000_000_000,
      }),
    ).toBe(true);
  });

  it("never forwards the honeypot field", async () => {
    const d = deps();
    await processContact(request(input), d);
    const fetchMock = d.fetchImpl as unknown as ReturnType<typeof vi.fn>;
    const body = (fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string;
    expect(JSON.parse(body)).not.toHaveProperty("website");
  });

  it("silently succeeds without delivering when the honeypot is filled", async () => {
    const d = deps();
    const result = await processContact(request({ ...input, website: "http://spam.test" }), d);
    expect(result).toEqual({ status: "success" });
    expect(d.fetchImpl).not.toHaveBeenCalled();
  });

  it("returns field errors and the entered values", async () => {
    const result = await processContact(
      request({ name: "J", email: "bad", message: "short" }),
      deps(),
    );
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.code).toBe("validation");
      expect(Object.keys(result.fieldErrors ?? {}).sort()).toEqual(["email", "message", "name"]);
      expect(result.values?.email).toBe("bad");
    }
  });

  it("rate limits per client", async () => {
    const d = deps();
    await processContact(request(input), d);
    await processContact(request(input), d);
    const third = await processContact(request(input), d);
    expect(third).toMatchObject({ status: "error", code: "rate_limited" });
    const other = await processContact(request(input, "9.9.9.9"), d);
    expect(other).toEqual({ status: "success" });
  });

  it("reports a delivery failure for non-2xx responses", async () => {
    const d = deps({
      fetchImpl: vi.fn(async () => new Response("no", { status: 500 })) as unknown as typeof fetch,
    });
    expect(await processContact(request(input), d)).toMatchObject({ code: "delivery_failed" });
  });

  it("reports a delivery failure when the request throws", async () => {
    const d = deps({
      fetchImpl: vi.fn(async () => Promise.reject(new Error("network"))) as unknown as typeof fetch,
    });
    expect(await processContact(request(input), d)).toMatchObject({ code: "delivery_failed" });
  });

  it("errors in production when no webhook is configured", async () => {
    const d = deps({ webhookUrl: undefined });
    expect(await processContact(request(input), d)).toMatchObject({ code: "not_configured" });
  });

  it("logs instead of sending in development when no webhook is configured", async () => {
    const log = vi.fn();
    const d = deps({ webhookUrl: undefined, devFallback: true, log });
    expect(await processContact(request(input), d)).toEqual({ status: "success" });
    expect(log).toHaveBeenCalledTimes(1);
  });

  it("sends unsigned requests when no secret is set", async () => {
    const d = deps({ webhookSecret: undefined });
    await processContact(request(input), d);
    const fetchMock = d.fetchImpl as unknown as ReturnType<typeof vi.fn>;
    const headers = (fetchMock.mock.calls[0] as [string, RequestInit])[1].headers as Record<
      string,
      string
    >;
    expect(headers).not.toHaveProperty("X-Signature");
  });
});
