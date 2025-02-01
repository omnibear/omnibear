import { defineConfig, defineRunnerConfig } from "wxt";
import preact from "@preact/preset-vite";

export default defineConfig({
  srcDir: "src",
  outDir: "dist",

  vite: () => ({
    plugins: [preact()],
  }),
  runner: {
    startUrls: ["https://omnibear.com"],
  },

  entrypointsDir: "entrypoints",
  publicDir: "../public",

  manifest: {
    permissions: ["storage", "contextMenus"],
    host_permissions: ["*://*/*"],
  },
});
