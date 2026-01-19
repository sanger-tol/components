/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import fs from "fs";
import path from "node:path";

// Paths to the key and certificate files
const keyPath = "/localhost.key";
const certPath = "/localhost.crt";

// Check if both the key and certificate files exist
const httpsConfig =
  fs.existsSync(keyPath) && fs.existsSync(certPath)
    ? {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    : false;

export default defineConfig({
  plugins: [react(), viteTsconfigPaths()],
  build: {
    emptyOutDir: true,
    outDir: "build",
  },
  resolve: {
    alias: [
      // Mock Next.js navigation imports that nextstepjs might try to access
      {
        find: 'next/navigation',
        replacement: path.join(process.cwd(), 'src/mocks/next-navigation.ts'),
      },
    ]
  },
  ssr: {
    noExternal: ['nextstepjs', 'motion']
  },
  optimizeDeps: {
    exclude: ["nextstepjs"],
    include: ["react", "react-dom"]
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    https: httpsConfig, // Apply the HTTPS configuration conditionally
    proxy: {
      "/api": {
        target: "http://components-api:80",
        secure: false,
        changeOrigin: true,
        ws: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    testMatch: ["**/*.test.tsx"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/playwright/**"],
    globals: true,
    onConsoleLog(log: string, type: "stdout" | "stderr"): false | void {
      console.log("log in test: ", log);
      if (log === "message from third party library" && type === "stdout") {
        return false;
      }
    },
    deps: {
      // force Vitest to treat these as ESM and bundle them into the
      // test environment, rather than trying to require() them
      inline: ["@react-leaflet/core", "react-leaflet-cluster"],
    },
  },
});
