# Contributing to Omnibear

## Related Repos

- [omnibear-site](https://github.com/omnibear/omnibear-site)

## Getting Started

1. Install npm dependencies using `npm install` (requires [Node.js](https://nodejs.org/en/download))
1. Run dev build `npm run dev` to build extension and open a browser with it installed
1. When the extension loads, open the popup settings and enable logs to help with debugging

## PR Submission Guidelines

1. Avoid large PRs without previous discussion in issues
1. Follow the existing coding standards
1. Ensure tests pass (`npm test`)
1. Clearly describe what the change does in the PR title/description

## Releases

The release process is still to be determined. See [WXT Publishing Docs](https://wxt.dev/guide/essentials/publishing.html) for a helpful command once the flow has been improved.

- Create a git tag
- Run zip command for both chrome and firefox
- Create a release in GitHub and attach the resources
- Upload the zip files to the respective web stores

## Libraries

- [webextension-polyfill](https://github.com/mozilla/webextension-polyfill): Chrome/Firefox compatibility
- [micropub-helper](https://github.com/grantcodes/micropub): Micropub API
- [microformats-parser](https://microformats.github.io/microformats-parser/): Parsing pages
- [preact](https://preactjs.com/): Rendering

## Application Structure

The application is divided by the type of entrypoints.
The entrypoints folder contains files which reference the logic in the corresponding folder.

### Manifest

A JSON file holding configuration of the extension to be used by browsers.
Differs between Firefox and Chrome depending on supported APIs.
Much of the manifest is auto generated.

### Popup

UI visible when clicking on the extension icon in the browser toolbar.
To debug this view in Chrome, click the extension icon to view the content and right click to access the inspect menu.

### Background

Off-UI script that can respond to browser events like tabs changing.
In Chrome, look for the service worker in the console selector and application settings.

### Content Script

The `page.js` script run on each webpage to check if it supports webmention or is the authentication page.
There is also a specific script for managing auth.

## Helpful Docs

- [WXT](https://wxt.dev/): Web extension publishing framework
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/get-started)
- [Firefox Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
