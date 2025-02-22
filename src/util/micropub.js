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
	.get([
		"domain",
		"authEndpoint",
		"tokenEndpoint",
		"micropubEndpoint",
		"token",
		"authSecret",
	])
	.then(
		({
			domain,
			authEndpoint,
			tokenEndpoint,
			micropubEndpoint,
			token,
			authSecret,
		}) => {
			if (!authSecret) {
				authSecret = generateAuthSecret();
				// Secret should be stable once set
				// TODO: Make sure background & popup use the same secret
				storage
					.set({ authSecret })
					.catch((error) => console.error("Problem saving authSecret", error));
			}

			micropub.setOptions({
				me: domain,
				authEndpoint,
				tokenEndpoint,
				micropubEndpoint,
				token,
				state: authSecret,
			});
		}
	);

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

function generateAuthSecret() {
	return (
		"very-secret-omnibear-state-" + Math.random().toString(36).substring(2, 15)
	);
}
