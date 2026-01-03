import { render, h } from "preact";
import App from "./components/App";
import { setContext, error } from "../util/log.js";

setContext("popup");

document.addEventListener("DOMContentLoaded", function () {
	if (window.location.search.includes("location=sidebar")) {
		document.body.classList.add("sidebar");
	}

	const appEl = document.getElementById("app");

	if (!appEl) {
		error("No app element found to render Omnibear.");
		return;
	}

	try {
		render(h(App, {}), appEl);
	} catch (e) {
		error("Error rendering Omnibear:", e);
		while (appEl.firstChild) {
			appEl.removeChild(appEl.firstChild);
		}
		const messageEl = document.createElement("p");
		const messageText = "message" in e ? e.message : String(e);
		messageEl.textContent = `Error rendering Omnibear: ${messageText}`;
		appEl?.appendChild(messageEl);
	}
});
