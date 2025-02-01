import { assert } from "chai";
import {
	getParamFromUrl,
	getParamFromUrlString,
	cleanUrl,
	paramsToQueryString,
	cleanParams,
} from "./url";

describe("url", function () {
	describe("cleanParams", function () {
		it("should remove utm_ params", function () {
			const params = {
				utm_campaign: "abcdef",
				other: "good",
			};
			const expected = {
				other: "good",
			};
			assert.deepEqual(expected, cleanParams(params));
		});
	});

	describe("paramsToQueryString", function () {
		it("should build param string", function () {
			const params = {
				one: "two",
				foo: "bar",
			};
			assert.equal("?one=two&foo=bar", paramsToQueryString(params));
		});

		it("should return empty string if no params", function () {
			assert.equal("", paramsToQueryString({}));
		});
	});

	describe("cleanUrl", function () {
		it("should not remove query params", function () {
			const url = "http://example.com/page?foo=true&bar=false";
			assert.equal(cleanUrl(url), url);
		});

		it("should remove hashes", function () {
			const url = "http://example.com/page#one";
			assert.equal(cleanUrl(url), "http://example.com/page");
		});

		it("should not alter already clean urls", function () {
			const url = "http://example.com/page";
			assert.equal(cleanUrl(url), "http://example.com/page");
		});

		it("should remove hash and leave query params", function () {
			const url = "http://example.com/posts/page.html?p=100#one";
			assert.equal(cleanUrl(url), "http://example.com/posts/page.html?p=100");
		});

		it("should trim utm_* params", function () {
			const url =
				"http://example.com/posts/34842?utm_campaign=CSS%2BLayout%2BNews&utm_medium=email&utm_source=CSS_Layout_News_83";
			assert.equal(cleanUrl(url), "http://example.com/posts/34842");
		});

		it("should retain non utm_* params", function () {
			const url =
				"http://example.com/posts/34842?utm_campaign=CSS%2BLayout%2BNews&utm_medium=email&utm_source=CSS_Layout_News_83&p=100";
			assert.equal(cleanUrl(url), "http://example.com/posts/34842?p=100");
		});

		it("should maintain port number", function () {
			const url = "http://example.com:8000/foo/bar?one=foo";
			assert.equal(cleanUrl(url), url);
		});
	});
});
