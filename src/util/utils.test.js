import { assert } from "chai";
import { generateSlug } from "./utils";

describe("generateSlug", function () {
	it("should replace spaces with dashes", function () {
		const content = "this is test content";
		const expected = "this-is-test-content";
		assert.equal(expected, generateSlug(content));
	});

	it("should trim whitespace from beginning and end", function () {
		const content = " test content ";
		const expected = "test-content";
		assert.equal(expected, generateSlug(content));
	});

	it("should limit to six words", function () {
		const content = "this is some test content with several words";
		const expected = "this-is-some-test-content-with";
		assert.equal(expected, generateSlug(content));
	});

	it("should convert to lowercase", function () {
		const content = "This is SoMe WEIRD CASING";
		const expected = "this-is-some-weird-casing";
		assert.equal(expected, generateSlug(content));
	});

	it("should omit non alphanumeric chars", function () {
		const content = "I'm taking y’all out (to dinner)";
		const expected = "im-taking-yall-out-to-dinner";
		assert.equal(expected, generateSlug(content));
	});

	it("should reduce double dashes", function () {
		const content = "a post  with lots--of----dashes";
		const expected = "a-post-with-lots-of-dashes";
		assert.equal(expected, generateSlug(content));
	});

	it("should latinize accented chars", function () {
		const content = "à pÓst wíth äçčeñt marks";
		const expected = "a-post-with-accent-marks";
		assert.equal(expected, generateSlug(content));
	});
});
