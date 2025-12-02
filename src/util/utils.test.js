import { describe, it, expect } from "vitest";
import { generateSlug } from "./utils";

describe("generateSlug", function () {
	it("should replace spaces with dashes", function () {
		const content = "this is test content";
		const expected = "this-is-test-content";
		expect(expected).toEqual(generateSlug(content));
	});

	it("should trim whitespace from beginning and end", function () {
		const content = " test content ";
		const expected = "test-content";
		expect(expected).toEqual(generateSlug(content));
	});

	it("should limit to six words", function () {
		const content = "this is some test content with several words";
		const expected = "this-is-some-test-content-with";
		expect(expected).toEqual(generateSlug(content));
	});

	it("should convert to lowercase", function () {
		const content = "This is SoMe WEIRD CASING";
		const expected = "this-is-some-weird-casing";
		expect(expected).toEqual(generateSlug(content));
	});

	it("should omit non alphanumeric chars", function () {
		const content = "I'm taking y’all out (to dinner)";
		const expected = "im-taking-yall-out-to-dinner";
		expect(expected).toEqual(generateSlug(content));
	});

	it("should reduce double dashes", function () {
		const content = "a post  with lots--of----dashes";
		const expected = "a-post-with-lots-of-dashes";
		expect(expected).toEqual(generateSlug(content));
	});

	it("should latinize accented chars", function () {
		const content = "à pÓst wíth äçčeñt marks";
		const expected = "a-post-with-accent-marks";
		expect(expected).toEqual(generateSlug(content));
	});
});
