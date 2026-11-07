"use server";

import { headers } from "next/headers";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { processContact, type ContactResult } from "@/lib/contact-service";
import { createRateLimiter } from "@/lib/rate-limit";

// Five messages per client every ten minutes. In-memory: resets on restart, per instance.
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function submitContact(
  _previous: ContactResult,
  formData: FormData,
): Promise<ContactResult> {
  const rawLocale = formData.get("locale");
  const locale = typeof rawLocale === "string" && isLocale(rawLocale) ? rawLocale : defaultLocale;

  const requestHeaders = await headers();
  const clientKey =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";

  return processContact(
    {
      formData,
      clientKey,
      locale,
      messages: getDictionary(locale).contact.form.validation,
    },
    {
      limiter,
      webhookUrl: process.env.CONTACT_WEBHOOK_URL,
      webhookSecret: process.env.CONTACT_WEBHOOK_SECRET,
      devFallback: process.env.NODE_ENV !== "production",
      log: (message, payload) => console.info(message, payload),
    },
  );
}
