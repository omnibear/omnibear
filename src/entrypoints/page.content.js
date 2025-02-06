import { defineContentScript } from "wxt/sandbox";
import main from "../content-scripts/page";

export default defineContentScript({
	matches: ["https://*/*", "http://*/*"],
	type: "module",
	main,
});
