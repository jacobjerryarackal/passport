import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const ROUTES = [
  { path: "/", name: "landing-page" },
  { path: "/dashboard", name: "dashboard" },
  { path: "/mandates", name: "mandates" },
  { path: "/purchases", name: "purchases" },
  { path: "/passports", name: "passports" },
  { path: "/passports/pass-giftcard-75", name: "passport-detail" },
  { path: "/disputes", name: "disputes" },
  { path: "/disputes/disp-chargeback-demo", name: "dispute-detail" },
  { path: "/evidence", name: "evidence" },
  { path: "/audit", name: "audit" },
  { path: "/demo", name: "demo-tour" },
];

test.describe("Passport Institutional Fintech Visual QA", () => {
  test.beforeAll(() => {
    const dir = path.join(process.cwd(), "test-results", "screenshots");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  for (const route of ROUTES) {
    test(`Route ${route.name} (${route.path}) - Multi-viewport & Theme Verification`, async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });
      page.on("pageerror", (err) => {
        consoleErrors.push(err.message);
      });
      page.on("response", (res) => {
        if (res.status() >= 500) {
          console.error(`[HTTP ${res.status()}] ${res.url()}`);
        }
      });

      // 1. Desktop Standard Dark Mode (1440×900)
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      const desktopOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      expect(desktopOverflow).toBe(false);

      await page.screenshot({
        path: path.join(
          process.cwd(),
          "test-results",
          "screenshots",
          `${route.name}-dark-1440.png`
        ),
        fullPage: true,
      });

      // 2. Desktop Standard Light Mode (1440×900)
      await page.evaluate(() => {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      });
      await page.waitForTimeout(400);

      await page.screenshot({
        path: path.join(
          process.cwd(),
          "test-results",
          "screenshots",
          `${route.name}-light-1440.png`
        ),
        fullPage: true,
      });

      // Switch back to Dark for remaining viewports
      await page.evaluate(() => {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
      });

      // 3. Desktop Wide Dark Mode (1920×1080)
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(300);

      const wideOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      expect(wideOverflow).toBe(false);

      await page.screenshot({
        path: path.join(
          process.cwd(),
          "test-results",
          "screenshots",
          `${route.name}-dark-1920-wide.png`
        ),
        fullPage: true,
      });

      // 4. Tablet Dark Mode (768×1024)
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(300);

      const tabletOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      expect(tabletOverflow).toBe(false);

      await page.screenshot({
        path: path.join(
          process.cwd(),
          "test-results",
          "screenshots",
          `${route.name}-dark-768-tablet.png`
        ),
        fullPage: true,
      });

      // 5. Mobile Dark Mode (390×844)
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(300);

      const mobileMetrics = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
        };
      });

      if (mobileMetrics.overflow) {
        console.warn(
          `[Mobile Overflow Warning] ${route.name}: scrollWidth=${mobileMetrics.scrollWidth}, innerWidth=${mobileMetrics.innerWidth}`
        );
      }

      expect(mobileMetrics.overflow).toBe(false);

      await page.screenshot({
        path: path.join(
          process.cwd(),
          "test-results",
          "screenshots",
          `${route.name}-dark-390-mobile.png`
        ),
        fullPage: false,
      });

      // Assert zero console errors
      expect(consoleErrors).toEqual([]);
    });
  }
});
