import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import { AUTH_SUCCESS_URL } from "./src/constants";

const target = process.env.TARGET || "chrome";

function generateManifest() {
	const manifest = readFileSync("src/manifest.json", "utf-8").replace(
		"{{AUTH_SUCCESS_URL}}",
		AUTH_SUCCESS_URL
	);
	const pkg = readJsonFile("package.json");
	return {
		...JSON.parse(manifest),
		description: pkg.description,
		version: pkg.version,
		homepage_url: pkg.homepage,
	};
}

/**
 * https://vitejs.dev/config/
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
	plugins: [
		preact(),
		webExtension({
			manifest: generateManifest,
			webExtConfig: {
				startUrl: "https://omnibear.com",
			},
		}),
	],
	define: {
		__BROWSER__: JSON.stringify(target),
		// Set some globals used by libraries to avoid ReferenceErrors
		global: {},
		// process is in some npm deps (e.g. rel-parser via micropub-helper)
		process: false,
	},
	sourcemap: true,
});
