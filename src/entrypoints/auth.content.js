import { defineContentScript } from "wxt/utils/define-content-script";
import main from "../content-scripts/auth.js";
import { AUTH_SUCCESS_URL } from "../constants.js";

export default defineContentScript({
	matches: [`${AUTH_SUCCESS_URL}/*`],
	main,
});
