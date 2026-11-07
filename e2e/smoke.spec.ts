import { expect, test } from "@playwright/test";

test("home page renders the hero and key sections", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveTitle(/Acme Digital/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Simple, transparent pricing" })).toBeVisible();
  await expect(page.getByText("Sample testimonials. Not from real clients.")).toBeVisible();
});

test("root redirects to a locale and the language switcher works", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(en|bn)$/);
  await page.goto("/en");
  await page.getByRole("link", { name: "বাংলা" }).click();
  await expect(page).toHaveURL(/\/bn$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
});

test("hreflang alternates and canonical are present", async ({ page }) => {
  await page.goto("/en/services");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/en\/services$/);
  await expect(page.locator('link[rel="alternate"][hreflang="bn"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
});

test("skip link moves focus to main content", async ({ page }) => {
  await page.goto("/en");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("theme toggle switches the colour scheme", async ({ page }) => {
  await page.goto("/en");
  const html = page.locator("html");
  const before = await html.evaluate((el) => el.classList.contains("dark"));
  await page.getByRole("button", { name: "Toggle colour theme" }).click();
  await expect(html).toHaveClass(before ? /^((?!dark).)*$/ : /dark/);
});

test("blog lists posts, paginates and serves an RSS feed", async ({ page, request }) => {
  await page.goto("/en/blog");
  await expect(page.getByRole("heading", { level: 1, name: "Blog" })).toBeVisible();
  await page.getByRole("link", { name: "Older posts" }).click();
  await expect(page).toHaveURL(/\/en\/blog\/page\/2$/);
  const rss = await request.get("/en/blog/rss.xml");
  expect(rss.ok()).toBe(true);
  expect(await rss.text()).toContain("<rss");
});

test("contact form shows accessible validation errors", async ({ page }) => {
  await page.goto("/en/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible();
  await expect(page.getByLabel("Your name")).toHaveAttribute("aria-invalid", "true");
});

test("sitemap and robots are served", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("hreflang");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Sitemap:");
});
