# Omnibear

For general usage information, see https://omnibear.com.

## Development

After cloning the repository, run `npm install` to install dependencies.

- `npm run build`: build into the `/dist` directory.
- `npm start`: build and automatically watch for changes and rebuild.
- `npm test`: run tests. `npm test -- --watch` will watch for changes and re-run tests every time. If you have issues, make sure you are using node 8.x (the LTS version).

## Installing from the repository

To install in Chrome from the repository:

1.  Navigate to [chrome://extensions/](chrome://extensions/)
2.  Check the “Developer mode” box
3.  Click “Load unpacked extension” and select the `/dist` directory of the repository

To install in Firefox from the repository:

1.  Navigate to [about:debugging](about:debugging)
2.  Click “Load Temporary Add-On”
3.  Navigate to the `/dist` directory and select the `manifest.json` file

Theoretically, this should work in MS Edge, too, but I don’t run Windows so I haven’t tested that out.

## Overview

Omnibear is run by three scripts:

- `src/entrypoints/background.js` — Runs in a [background page](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#Background_scripts). This keeps track of which tab currently has the user's focus and handles communication between the page script and omnibear popup script.
- `src/page.js` — A [content script](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#Content_scripts) that runs in all pages (tabs). This highlights selected entries when the user right-clicks them. It alerts the background script whenever its tab receives user focus. And it watches for when the browser navigates to the authentication successful page on omnibear.com.
- `src/index.js` — The main script of the [popup page](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#Sidebars_popups_options_pages). This is a small webapp built using [Preact](https://preactjs.com/) and [MobX](https://mobx.js.org/) that includes the posting form and settings screen.

Authentication details, user settings, and the note draft are stored in Omnibear’s localStorage.
