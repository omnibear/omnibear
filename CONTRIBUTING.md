# Contributing to Omnibear

Welcome to the Omnibear source repository.
We welcome contributions to this project.

## Getting Started

1. Install npm dependencies using `npm install` (requires [Node.js](https://nodejs.org/en/download))
1. Run dev build `npm run dev` to build extension and open a browser with it installed
1. When the extension loads, open the popup settings and enable logs to help with debugging
1. If you need a quick login for testing, you can login anonymously with https://commentpara.de/

## Project Documentation

Most of the documentation for Omnibear should live on the omnibear.com site.
If you would like to contribute documetation, see
the [omnibear-site](https://github.com/omnibear/omnibear-site) GitHub repository.

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

- [micropub-helper](https://github.com/grantcodes/micropub): Micropub API
- [microformats-parser](https://microformats.github.io/microformats-parser/): Parsing pages
- [preact](https://preactjs.com/): Rendering

## Application Structure

The application is divided by the type of entrypoints.
The entrypoints folder contains files which reference the logic in the corresponding folder.

### Config

Most of the config files are in the root of the project

- `package.json`: NPM project and dependency config
- `wxt.config.ts`: Build framework config. Also where manifest is configured.
- `tsconfig.json`: TypeScript configuration
- `vitest.config.ts`: Testing config
- `.nvmrc`: Which version of Node.js to use
- `.editorconfig`: Some code style configuration

### Entrypoints

Based on the WXT structure, the files under `src/entrypoints` indicate starting points for extension bundles depending on where the code is used. See the following sections for more information.

### Popup

The UI visible when clicking on the extension icon in the browser toolbar.
Most related code is in the `src/popup` folder.
Preact is the framework of choice for the UI.
To debug this view in Chrome, click the extension icon to view the content and right click to access the inspect menu.

### Background

Off-UI script that can respond to browser events like tabs changing.
Since manifest v3, this runs as a service worker and is primarily event based.
The code for this service worker is in `src/background`.
In Chrome, look for the service worker in the console selector and application settings.

### Content Scripts

The `src/content-scripts/page.js` script runs on each webpage to update the record of the current URL and check if it supports webmention.
There is also a `src/content-scripts/auth.js` script for managing auth responses.

### Utils

The `src/util` folder contains various files that potentially can be used in multiple bundles.

## Helpful Docs

- [WXT](https://wxt.dev/): Web extension publishing framework
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/get-started)
- [Firefox Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
