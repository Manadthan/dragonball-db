import { defineConfig, devices } from "@playwright/test";

const PORT = 3101;

const iphone12Mini = {
  ...devices["iPhone 12 Mini"],
  viewport: { width: 375, height: 812 },
};

try {
  process.loadEnvFile(".env.local");
} catch {
  // Variables fournies par l'environnement ou absentes.
}

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: process.env.CI ? "on-first-retry" : "off",
  },
  projects: [
    {
      name: "iphone-12-mini",
      use: { ...iphone12Mini, browserName: "chromium" as const },
    },
    ...(process.env.CI
      ? [
          {
            name: "iphone-12-mini-webkit",
            use: { ...iphone12Mini, browserName: "webkit" as const },
          },
        ]
      : []),
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
