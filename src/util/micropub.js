import Micropub from "micropub-helper";
import storage from "./storage";
import { AUTH_SUCCESS_URL } from "../constants";

const micropub = new Micropub({
	clientId: "https://omnibear.com",
	redirectUri: AUTH_SUCCESS_URL,
	state: "very-secret-omnibear-state",
	scope: "create delete update",
});
export default micropub;

// Load settings when available
storage
	.get(["domain", "authEndpoint", "tokenEndpoint", "micropubEndpoint", "token"])
	.then(({ domain, authEndpoint, tokenEndpoint, micropubEndpoint, token }) => {
		micropub.setOptions({
			me: domain,
			authEndpoint,
			tokenEndpoint,
			micropubEndpoint,
			token,
		});
	});

export function postNote(entry, aliases) {
	return micropub.create(
		{
			h: "entry",
			content: entry.content,
			category: entry.tagsArray,
			[aliases.slug]: entry.slug,
			[aliases.syndicateTo]: entry.syndicateList,
		},
		"form"
	);
}

export function postReply(entry, url, aliases) {
	return micropub.create(
		{
			h: "entry",
			"in-reply-to": url,
			content: entry.content,
			category: entry.tagsArray,
			[aliases.slug]: entry.slug,
			[aliases.syndicateTo]: entry.syndicateList,
		},
		"form"
	);
}

export function postBookmark(entry, url, aliases) {
	return micropub.create(
		{
			h: "entry",
			"bookmark-of": url,
			name: entry.title,
			content: entry.content,
			category: entry.tagsArray,
			[aliases.slug]: entry.slug,
			[aliases.syndicateTo]: entry.syndicateList,
		},
		"form"
	);
}

export function postLike(url) {
	const entry = {
		h: "entry",
		"like-of": url,
	};
	return micropub.create(entry, "form");
}

export function postRepost(url) {
	const entry = {
		h: "entry",
		"repost-of": url,
	};
	return micropub.create(entry, "form");
}
