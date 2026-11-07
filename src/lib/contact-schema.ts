import { z } from "zod";

export const CONTACT_FIELDS = ["name", "email", "company", "budget", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export const BUDGET_OPTIONS = ["under-2k", "2k-5k", "5k-15k", "15k-plus", "not-sure"] as const;

export interface ContactMessages {
  nameRequired: string;
  emailInvalid: string;
  messageShort: string;
  messageLong: string;
  budgetInvalid: string;
}

export const defaultContactMessages: ContactMessages = {
  nameRequired: "Please enter your name.",
  emailInvalid: "Please enter a valid email address.",
  messageShort: "Please write at least 20 characters.",
  messageLong: "Please keep your message under 4000 characters.",
  budgetInvalid: "Please choose one of the options.",
};

export function createContactSchema(messages: ContactMessages = defaultContactMessages) {
  return z.object({
    name: z.string().trim().min(2, messages.nameRequired).max(100, messages.nameRequired),
    email: z.string().trim().max(254, messages.emailInvalid).pipe(z.email(messages.emailInvalid)),
    company: z.string().trim().max(120).optional().default(""),
    // An unselected <select> posts "" which should mean "not provided".
    budget: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.enum(BUDGET_OPTIONS, messages.budgetInvalid).optional(),
    ),
    message: z.string().trim().min(20, messages.messageShort).max(4000, messages.messageLong),
    /** Honeypot: real users never see or fill this field. */
    website: z.string().max(0).optional().default(""),
  });
}

export type ContactInput = z.infer<ReturnType<typeof createContactSchema>>;

export type FieldErrors = Partial<Record<ContactField, string>>;

/** Collapse zod issues to the first message per field. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && (CONTACT_FIELDS as readonly string[]).includes(key)) {
      const field = key as ContactField;
      if (!result[field]) result[field] = issue.message;
    }
  }
  return result;
}

/** Turn FormData into a plain object, ignoring non-string entries. */
export function formDataToObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}
