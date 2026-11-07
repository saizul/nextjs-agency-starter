import { describe, expect, it } from "vitest";
import { createContactSchema, formDataToObject, toFieldErrors } from "./contact-schema";

const valid = {
  name: "Jane Doe",
  email: "jane@example.com",
  message: "I would like to discuss a new website project.",
};

describe("contact schema", () => {
  const schema = createContactSchema();

  it("accepts a minimal valid submission", () => {
    const result = schema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.company).toBe("");
  });

  it("trims whitespace", () => {
    const result = schema.parse({ ...valid, name: "  Jane  " });
    expect(result.name).toBe("Jane");
  });

  it("rejects short names, bad emails and short messages", () => {
    const result = schema.safeParse({ name: "J", email: "nope", message: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = toFieldErrors(result.error);
      expect(Object.keys(errors).sort()).toEqual(["email", "message", "name"]);
    }
  });

  it("uses custom messages", () => {
    const custom = createContactSchema({
      nameRequired: "N",
      emailInvalid: "E",
      messageShort: "S",
      messageLong: "L",
      budgetInvalid: "B",
    });
    const result = custom.safeParse({ ...valid, email: "x", budget: "bogus" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = toFieldErrors(result.error);
      expect(errors.email).toBe("E");
      expect(errors.budget).toBe("B");
    }
  });

  it("limits message length", () => {
    const result = schema.safeParse({ ...valid, message: "x".repeat(4001) });
    expect(result.success).toBe(false);
  });

  it("accepts known budget options only", () => {
    expect(schema.safeParse({ ...valid, budget: "2k-5k" }).success).toBe(true);
    expect(schema.safeParse({ ...valid, budget: "1-million" }).success).toBe(false);
  });

  it("treats an empty budget selection as not provided", () => {
    const result = schema.safeParse({ ...valid, budget: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.budget).toBeUndefined();
  });

  it("rejects a filled honeypot", () => {
    expect(schema.safeParse({ ...valid, website: "http://spam.test" }).success).toBe(false);
  });

  it("converts FormData to a plain object", () => {
    const fd = new FormData();
    fd.set("name", "Jane");
    fd.set("file", new Blob(["x"]), "x.txt");
    expect(formDataToObject(fd)).toEqual({ name: "Jane" });
  });
});
