import { describe, it, expect } from "vitest";
import {
	getParamFromUrl,
	getParamFromUrlString,
	cleanUrl,
	cleanParams,
} from "./url";

describe("url", function () {
	describe("cleanParams", function () {
		it("should remove utm_ params", function () {
			const params = new URLSearchParams("utm_campaign=abcdef&other=good");

			cleanParams(params);

			expect("other=good").toEqual(params.toString());
		});
	});

	describe("cleanUrl", function () {
		it("should not remove query params", function () {
			const url = "http://example.com/page?foo=true&bar=false";
			expect(cleanUrl(url)).toEqual(url);
		});

		it("should remove hashes", function () {
			const url = "http://example.com/page#one";
			expect(cleanUrl(url)).toEqual("http://example.com/page");
		});

		it("should not alter already clean urls", function () {
			const url = "http://example.com/page";
			expect(cleanUrl(url)).toEqual("http://example.com/page");
		});

		it("should remove hash and leave query params", function () {
			const url = "http://example.com/posts/page.html?p=100#one";
			expect(cleanUrl(url)).toEqual("http://example.com/posts/page.html?p=100");
		});

		it("should trim utm_* params", function () {
			const url =
				"http://example.com/posts/34842?utm_campaign=CSS%2BLayout%2BNews&utm_medium=email&utm_source=CSS_Layout_News_83";
			expect(cleanUrl(url)).toEqual("http://example.com/posts/34842");
		});

		it("should retain non utm_* params", function () {
			const url =
				"http://example.com/posts/34842?utm_campaign=CSS%2BLayout%2BNews&utm_medium=email&utm_source=CSS_Layout_News_83&p=100";
			expect(cleanUrl(url)).toEqual("http://example.com/posts/34842?p=100");
		});

		it("should maintain port number", function () {
			const url = "http://example.com:8000/foo/bar?one=foo";
			expect(cleanUrl(url)).toEqual(url);
		});
	});
});
