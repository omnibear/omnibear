import http from "http";
import { Indiekit } from "@indiekit/indiekit";
import makeDebug from "debug";
import { rmdir } from "node:fs/promises";

const hostname = "localhost"; // or */ "127.0.0.1";
const websitePort = 4000;
const micropubPort = 4001;
const webAddress = `http://${hostname}:${websitePort}/`;

/** A simple website that points to the micropub server in the head link tags */
function startWebsiteServer() {
	const websiteServer = http.createServer((req, res) => {
		res.statusCode = 200;
		res.end(`

	<!doctype html>
	<html lang=en-US>
		<head>
			<meta charset=utf-8>
			<meta content="IE=edge" http-equiv=X-UA-Compatible>
			<meta content="width=device-width,initial-scale=1" name=viewport>
			<title>Test server for Omnibear testing</title>
			<link rel=micropub href=http://localhost:${micropubPort}/micropub>
			<link rel=authorization_endpoint href=http://localhost:${micropubPort}/auth>
			<link rel=token_endpoint href=http://localhost:${micropubPort}/auth/token>
			<link rel=indieauth-metadata href=http://localhost:${micropubPort}/.well-known/oauth-authorization-server>
		</head>
		<body>
			<h1>Test server for Omnibear testing</h1>
			<p>
				Use <code>${webAddress}</code> as your website to log in with Omnibear.
			</p>
			<p>
				Login to the <a href="http://localhost:${micropubPort}">Micropub server</a> with <code>password</code>.
			</p>
		</body>
	</html>`);
	});

	websiteServer.listen(websitePort, hostname, () => {
		console.log(`Website server running at ${webAddress}`);
	});
}

/**
 * Starts up a local micropub server for Omnibear to connect to.
 * The micropub requests will be saved to the local file system.
 */
async function startMicropubServer() {
	await rmdir("e2e/server/posts", { recursive: true, force: true });

	// Indiekit uses the debug package for logging.
	// Can consider reducing the logging if it is too noisy.
	makeDebug.enable(`*`);

	const indiekit = await Indiekit.initialize({
		config: {
			application: {
				port: 4001,
			},
			plugins: ["@indiekit/store-file-system"],
			publication: {
				me: `${webAddress}`,
				postTemplate: (properties) => JSON.stringify(properties, null, 2),
				postTypes: [
					"article",
					"bookmark",
					"like",
					"note",
					"photo",
					"reply",
				].reduce(
					(config, type) => ({
						...config,
						[type]: {
							name: type,
							post: { path: `/posts/${type}/{slug}.json` },
						},
					}),
					{},
				),
			},
			"@indiekit/store-file-system": {
				directory: "e2e/server/posts",
			},
		},
	});

	indiekit.server();
}

startWebsiteServer();
startMicropubServer();
