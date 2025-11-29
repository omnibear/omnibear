import { defineContentScript } from "wxt/utils/define-content-script";
import main from "../content-scripts/auth";
import { AUTH_SUCCESS_URL } from "../constants";

export default defineContentScript({
	matches: [`${AUTH_SUCCESS_URL}/*`],
	main,
});
