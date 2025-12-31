# Contributing to Omnibear

Welcome to the Omnibear source repository.
We welcome contributions to this project.

## Getting Started

1. Install npm dependencies using `npm install` (requires [Node.js](https://nodejs.org/en/download))
1. Run dev build `npm run dev` to build extension and open a browser with it installed
1. When the extension loads, open the popup settings and enable logs to help with debugging
1. If you need a quick login for testing, you can login anonymously with https://commentpara.de/ which works for replies and likes

## Installing a local version

If you want to install a local, unsigned version of Omnibear without running the dev server, see the instructions in the [README.md](/README.md).

## Project Documentation

Most of the documentation for Omnibear should live on the omnibear.com site.
If you would like to contribute documetation, see
the [omnibear-site](https://github.com/omnibear/omnibear-site) GitHub repository.

## Manual Testing Guide

Ultimately, there should be some end-to-end tests for these.
But the following are the general flows that should work.

1. You can log into an IndieAuth account that supports micropub
1. Settings are persisted and applied
1. The replies view updates to the current page URL
1. Individual properties of the post forms are sent correctly
1. You can reply to a particular h-entry on a page with the context menu on a page marked up with h-feed microformats
1. Check the logs (background, content scripts, and popup) for unexpected errors
1. All the above should work even after the background service worker terminates (goes idle)

## PR Submission Guidelines

1. Avoid large PRs without previous discussion in issues
1. Follow the existing coding standards
1. Ensure tests pass (`npm test`)
1. Ensure formatting checks pass (`npm run checks`)
1. Clearly describe what the change does in the PR title/description

## Application Structure

The application is divided by the type of entrypoints.
The entrypoints folder contains files which reference the logic in the corresponding folder.

### Config

Most of the config files are in the root of the project

- `package.json`: NPM project and dependency config
- `wxt.config.ts`: Build framework config. Also where manifest is configured.
- `tsconfig.json`: TypeScript configuration for type checking
- `eslint.config.js`: ESLint configuration
- `vitest.config.ts`: Testing config
- `.nvmrc`: Which version of Node.js to use
- `.editorconfig`: Some code style configuration

### Entrypoints

Based on the WXT structure, the files under `src/entrypoints` indicate starting points for extension bundles depending on where the code is used.
Each top level file/folder here will create its own bundle.
See the following sections for more information.

### Popup

The popup is the UI visible when clicking on the extension icon in the browser toolbar.
Most of the related code is in the `src/popup` folder.
This is implemented using the Preact framework which is similar to React.
To debug this view in Chrome, click the extension icon to view the content and right click to access the inspect menu.

### Background

Thi is the off-UI script that can respond to browser events like tabs changing.
Since the manifest v3 upgrade, this runs as a service worker and is primarily event based.
Be aware that this code does not run constantly and will be terminated by the browser when idling.
The code for this service worker is in `src/background`.
In Chrome, look for the service worker in the console selector and application settings.
You can also usually find an inspect link from the browser manage extension view with developer debugging enabled.

### Content Scripts

The `src/content-scripts/page.js` script runs on each webpage to update the record of the current URL and check if it supports webmention.
There is also a `src/content-scripts/auth.js` script for managing auth responses.
Both the content scripts pass messages to the background service to avoid impacting the main thread.

### Utils

The `src/util` folder contains various files that potentially can be used in multiple bundles.

### Tests

Unit tests should be written in a \*.test.js file next to the file that it is testing.
Please ensure all unit tests are passing before requesting PR reviews.

### Types

The codebase is incrementally adding type hints using JSDoc comments.
Please add types for new code as you can but full type coverage is not expected.
There are many existing type errors (mostly missing types defined as `any`) that you can ignore.
Currently, I'm not planning on migrating to full TypeScript.
There are a few type definition files (.d.ts) such as `src/globals.d.ts` which can be helpful for defining reusable types.

## Helpful Docs

- [WXT](https://wxt.dev/): Web extension publishing framework
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/get-started)
- [Firefox Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Mozilla Extension Workshop](https://extensionworkshop.com/)

### Libraries

- [micropub-helper](https://github.com/grantcodes/micropub): Micropub API
- [microformats-parser](https://microformats.github.io/microformats-parser/): Parsing pages
- [preact](https://preactjs.com/): Rendering
- [typescript](https://www.typescriptlang.org/): Type checker
- [eslint](https://eslint.org/): Code linting
- [prettier](https://prettier.io/): Code formatting

## Releases

> **Note**: This section is primarily for the project maintainer

See [WXT Publishing Docs](https://wxt.dev/guide/essentials/publishing.html) for details on the `submit` command.

- The first time, set up the credentials: `npx wxt submit init`
- Run `npm run zip && npm run zip:firefox`
- Run the below `wxt submit` command after generating zip files
- Create a git tag
- Create a release in GitHub and attach the resources
- Update the release notes in the web stores
- Update the release notes on the website

```bash
npx wxt submit --dry-run \
    --firefox-zip dist/omnibear-${VERSION}-firefox.zip --firefox-sources-zip dist/omnibear-${VERSION}-sources.zip \
    --edge-zip dist/omnibear-${VERSION}-chrome.zip
```

When set up, add Chrome

```bash
    --chrome-zip dist/omnibear-${VERSION}-chrome.zip \
```

Replace `${VERSION}` with your desired version, or set it as an environment variable before running the command:

```bash
export VERSION=1.2.3
```
