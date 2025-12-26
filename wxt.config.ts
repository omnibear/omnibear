import { defineConfig } from "wxt";
import preact from "@preact/preset-vite";

export default defineConfig({
  srcDir: "src",
  outDir: "dist",

  vite: () => ({
    plugins: [preact()],
  }),
  webExt: {
    startUrls: ["https://omnibear.com"],
  },

  entrypointsDir: "entrypoints",
  publicDir: "./public",

  modules: ['@wxt-dev/webextension-polyfill'],
  manifest: {
    permissions: ["storage", "contextMenus"],
    host_permissions: ["*://*/*"],
  },
});
