# Contributing to Omnibear

## Related Repos

- [omnibear-site](https://github.com/keithjgrant/omnibear-site)

## Tools

- [WXT](https://wxt.dev/)

## Getting Started

1. Install npm dependencies using `npm install` (requires Node.js)
2. Run dev build `npm run dev` to build extension and open a browser with it installed

## Releases

TODO: Would like to stop pushing `/dist` folder to repo.
Instead release tags should include the browser bundles for users to download. 

## Libraries

- [webextension-polyfill](https://github.com/mozilla/webextension-polyfill): Chrome/Firefox compatibility
- micropub-helper: Micropub API
- microformat-shiv: Parsing pages 
- preact: Rendering

## Application Structure

### Manifest

JSON configuration of the extension used by browsers.
Differs between Firefox and Chrome depending on supported APIs.

### Action

UI visible when clicking on the extension icon in the browser toolbar.
In Firefox, this extension uses the same view for the sidebar.
To debug this view, click the extension icon to view the content and right click to access the inspect menu.

### Background

Off-UI script that can respond to browser events like tabs changing.
In Chrome, look for the service worker in the console selector and application settings.

### Content Script

The `page.js` script run on each webpage to check if it supports webmention or is the authentication page.

## Helpful Docs
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/get-started) 
- [Firefox Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
