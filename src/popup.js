import { render, h } from "preact";
import App from "./components/App";

document.addEventListener("DOMContentLoaded", function () {
	if (window.location.search.includes("location=sidebar")) {
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
