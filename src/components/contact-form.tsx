"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { BUDGET_OPTIONS } from "@/lib/contact-schema";
import type { ContactResult } from "@/lib/contact-service";
import { submitContact } from "@/app/[locale]/contact/actions";
import { cx } from "./ui";

const initialState: ContactResult = { status: "idle" };

const inputClass =
  "mt-1 block w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-fg placeholder:text-muted aria-[invalid=true]:border-red-600";

export function ContactForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.contact.form;
  const [state, action, pending] = useActionState(submitContact, initialState);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
    if (state.status === "success") successRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-emerald-600 bg-emerald-50 p-6 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50"
      >
        <h2 className="text-xl font-semibold">{t.successTitle}</h2>
        <p className="mt-2">{t.successBody}</p>
      </div>
    );
  }

  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};
  const errorEntries = Object.entries(fieldErrors);

  const describedBy = (field: string, hint = false) =>
    [
      hint ? `${field}-hint` : null,
      fieldErrors[field as keyof typeof fieldErrors] ? `${field}-error` : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const fieldError = (field: keyof typeof fieldErrors) =>
    fieldErrors[field] ? (
      <p id={`${field}-error`} className="mt-1 text-sm font-medium text-red-700 dark:text-red-400">
        {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <form action={action} noValidate className="space-y-5" aria-busy={pending}>
      {state.status === "error" && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-red-600 bg-red-50 p-4 text-red-950 dark:bg-red-950 dark:text-red-50"
        >
          <p className="font-semibold">{t.errors[state.code]}</p>
          {errorEntries.length > 0 && (
            <>
              <p className="mt-1 text-sm">{t.errorSummary}</p>
              <ul className="mt-2 list-disc ps-5 text-sm">
                {errorEntries.map(([field, message]) => (
                  <li key={field}>
                    <a href={`#${field}`} className="underline">
                      {message}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <input type="hidden" name="locale" value={locale} />

      {/* Honeypot: hidden from people and assistive tech, attractive to bots. */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
        <label>
          {t.honeypotLabel}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="name" className="font-medium">
          {t.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          defaultValue={values.name}
          aria-invalid={fieldErrors.name ? true : undefined}
          aria-describedby={describedBy("name")}
          className={inputClass}
        />
        {fieldError("name")}
      </div>

      <div>
        <label htmlFor="email" className="font-medium">
          {t.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={values.email}
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={describedBy("email")}
          className={inputClass}
        />
        {fieldError("email")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className="font-medium">
            {t.company}
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            defaultValue={values.company}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="budget" className="font-medium">
            {t.budget}
          </label>
          <select
            id="budget"
            name="budget"
            defaultValue={values.budget ?? ""}
            aria-invalid={fieldErrors.budget ? true : undefined}
            aria-describedby={describedBy("budget")}
            className={inputClass}
          >
            <option value="">{t.budgetPlaceholder}</option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t.budgetOptions[option]}
              </option>
            ))}
          </select>
          {fieldError("budget")}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="font-medium">
          {t.message}
        </label>
        <p id="message-hint" className="text-sm text-muted">
          {t.messageHint}
        </p>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          defaultValue={values.message}
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={describedBy("message", true)}
          className={inputClass}
        />
        {fieldError("message")}
      </div>

      <button
        type="submit"
        disabled={pending}
        className={cx(
          "inline-flex items-center justify-center rounded-full bg-brand-solid px-6 py-3 font-semibold text-white hover:bg-indigo-700",
          "disabled:cursor-not-allowed disabled:opacity-70",
        )}
      >
        {pending ? t.sending : t.submit}
      </button>
    </form>
  );
}
