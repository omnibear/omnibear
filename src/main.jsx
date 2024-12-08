import { render, h } from "preact";
import App from "./components/App";
// import store from './stores/store';
// import authStore from './stores/authStore';
// import draftStore from './stores/draftStore';
// import settingsStore from './stores/settingsStore';
import "./fonts.css";
import "./styles.css";

// configure({ enforceActions: true });

// const stores = {
//   store,
//   auth: authStore,
//   draft: draftStore,
//   settings: settingsStore,
// };

console.log("Loading UI");

window.addEventListener("error", function (e) {
  // TODO: Remove this before publishing
  document.getElementById(
    "app"
  ).innerHTML = `<p>Error rendering Omnibear: ${e}</p>`;
  return false;
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Content Loaded");
  if (window.location.search.includes("location=sidebar")) {
    console.log("sidebar");
    document.body.classList.add("sidebar");
  }
  document.getElementById("app").innerHTML = "DOM Content Loaded";

  try {
    render(h(App), document.getElementById("app"));
  } catch (e) {
    document.getElementById(
      "app"
    ).innerHTML = `<p>Error rendering Omnibear: ${e}</p>`;
  }
});
