import { render, h } from "preact";
import App from "./components/App";

// configure({ enforceActions: true });

// Needed by lib
globalThis.global = globalThis;

console.log("Loading UI");

document.addEventListener("DOMContentLoaded", function () {
	console.log("DOM Content Loaded");
	if (window.location.search.includes("location=sidebar")) {
		console.log("sidebar");
		document.body.classList.add("sidebar");
	}

	try {
		render(h(App), document.getElementById("app"));
	} catch (e) {
		document.getElementById(
			"app"
		).innerHTML = `<p>Error rendering Omnibear: ${e}</p>`;
	}
});
