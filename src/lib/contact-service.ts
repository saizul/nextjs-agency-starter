import { buildSignatureHeaders } from "./hmac";
import {
  createContactSchema,
  formDataToObject,
  toFieldErrors,
  type ContactMessages,
  type FieldErrors,
} from "./contact-schema";
import type { RateLimiter } from "./rate-limit";

export type ContactErrorCode = "validation" | "rate_limited" | "not_configured" | "delivery_failed";

export type ContactResult =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      code: ContactErrorCode;
      fieldErrors?: FieldErrors;
      /** Values to repopulate the form with after a failed submit. */
      values?: Record<string, string>;
    };

export interface ContactDeps {
  limiter: RateLimiter;
  webhookUrl?: string;
  webhookSecret?: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
  /** Used in non-production when no webhook is configured. */
  devFallback?: boolean;
  log?: (message: string, payload?: unknown) => void;
  timeoutMs?: number;
}

export interface ContactRequest {
  formData: FormData | Record<string, string>;
  clientKey: string;
  locale: string;
  messages: ContactMessages;
}

/**
 * Core of the contact server action, kept free of Next.js APIs so it can be unit tested.
 * Order: honeypot -> rate limit -> validation -> delivery.
 */
export async function processContact(
  { formData, clientKey, locale, messages }: ContactRequest,
  deps: ContactDeps,
): Promise<ContactResult> {
  const raw = formData instanceof FormData ? formDataToObject(formData) : formData;
  const now = deps.now ?? Date.now;
  const doFetch = deps.fetchImpl ?? fetch;

  // Honeypot: bots fill every field. Pretend success without doing any work.
  if (raw.website && raw.website.trim() !== "") {
    return { status: "success" };
  }

  const limit = deps.limiter.check(clientKey);
  if (!limit.allowed) {
    return { status: "error", code: "rate_limited", values: raw };
  }

  const parsed = createContactSchema(messages).safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      code: "validation",
      fieldErrors: toFieldErrors(parsed.error),
      values: raw,
    };
  }

  const { website: _website, ...fields } = parsed.data;
  const payload = JSON.stringify({
    ...fields,
    locale,
    submittedAt: new Date(now()).toISOString(),
    source: "nextjs-agency-starter",
  });

  if (!deps.webhookUrl) {
    if (deps.devFallback) {
      deps.log?.("[contact] No CONTACT_WEBHOOK_URL set; submission logged only.", fields);
      return { status: "success" };
    }
    return { status: "error", code: "not_configured", values: raw };
  }

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (deps.webhookSecret) {
      Object.assign(headers, buildSignatureHeaders(payload, deps.webhookSecret, now()));
    }
    const response = await doFetch(deps.webhookUrl, {
      method: "POST",
      headers,
      body: payload,
      signal: AbortSignal.timeout(deps.timeoutMs ?? 8000),
    });
    if (!response.ok) {
      return { status: "error", code: "delivery_failed", values: raw };
    }
    return { status: "success" };
  } catch {
    return { status: "error", code: "delivery_failed", values: raw };
  }
}
