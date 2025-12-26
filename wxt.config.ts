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
  imports: false,

  modules: ['@wxt-dev/webextension-polyfill'],
  manifest: {
    permissions: ["storage", "contextMenus"],
    host_permissions: ["*://*/*"],
    browser_specific_settings: {
      gecko: {
        id: "{27d422d7-d781-4ff7-a476-ba7c18601a22}",
        strict_min_version: "140.0",
        data_collection_permissions: {
          required: ["none"]
        }
      }
    }
  },
});
