# Omnibear

[![Node.js CI](https://github.com/omnibear/omnibear/actions/workflows/ci.yaml/badge.svg)](https://github.com/omnibear/omnibear/actions/workflows/ci.yaml)

Omnibear is a Micropub client browser extension for posting to your website.  For general usage information and documentation, see https://omnibear.com.

## Extension Status

This browser extension is in the process of being updated to newer web extension APIs.
If you would like to be involved in updates, reach out to @aciccarello in a GitHub issue, via email, or in [indieweb-dev chat](https://chat.indieweb.org/dev/).

## Development

Your contributions are welcome!
See [CONTRIBUTING.md](/CONTRIBUTING.md) for instructions on local development.

## Installing from a zip file

Omnibear is open source and any security issues are taken seriously, but it is important to be aware of the security implications of installing extensions directly.
Unless you need to run a pre-release version of Omnibear, you should be installing from the official links on https://omnibear.com/

> **Important**: Be careful when installing browser extensions you do not trust. The official web extension stores will take down malicious extensions but an extension installed via "developer mode" won't have any checks. Be sure you trust the developer who wrote the extension.

To install in Chrome from the repository:

1. Download the .zip file from the [releases](https://github.com/omnibear/omnibear/releases) page OR run `npm run zip` in the repository root (after `npm install`)
1.  Navigate to [chrome://extensions/](chrome://extensions/)
2.  Check the “Developer mode” box
3.  Click “Load unpacked extension”
3.  Navigate to the downloaded .zip file OR if building locally the .zip file from the `/dist` directory

To install in Firefox from the repository:

1. Download the .zip file from the [releases](https://github.com/omnibear/omnibear/releases) page OR run `npm run zip:firefox` in the repository root (after `npm install`)
1. In Firefox, navigate to [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox) or "Manage Extensions" > "Debug Add-ons"
2.  Click “Load Temporary Add-On”
3.  Navigate to the downloaded .zip file OR if building locally the .zip file from the `/dist` directory

To install in MS Edge from the repository, follow the Chrome directions.
