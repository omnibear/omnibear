import { defineContentScript } from "wxt/utils/define-content-script";
import main from "../content-scripts/page";

export default defineContentScript({
	matches: ["https://*/*", "http://*/*"],
	main,
});
