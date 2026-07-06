import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname,
      "server-only": new URL("test/__mocks__/server-only.ts", import.meta.url)
        .pathname,
    },
  },
});
