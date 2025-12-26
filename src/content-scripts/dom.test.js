import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { getAncestorNode, getAncestorNodeByClass } from "./dom";

/**
 * @param {string} html HTML to render
 */
const jsdom = (html) => new JSDOM(html).window.document;

describe("page/dom", function () {
	describe("getAncestorNodeByClass", function () {
		it("should find container node", function () {
			const document = jsdom(`
        <body>
          <div class="target" id="the-container">
            <div>
              <button id="el">click</button>
            </div>
          </div>
        </body>
      `);
			const el = document.getElementById("el");
			// compare ids for equality check
			expect(getAncestorNodeByClass(el, "target").id).toEqual("the-container");
		});

		it("should find return null if not found", function () {
			const document = jsdom(`
        <body>
          <div>
            <div>
              <button id="el">click</button>
            </div>
          </div>
        </body>
      `);
			const el = document.getElementById("el");
			expect(getAncestorNodeByClass(el, "target")).toBeNull();
		});

		it("should not find find target if not a direct ancestor", function () {
			const document = jsdom(`
        <body>
          <div>
            <div>
              <button id="el">click</button>
            </div>
            <div class="target">the target</div>
          </div>
        </body>
      `);
			const el = document.getElementById("el");
			expect(getAncestorNodeByClass(el, "target")).toBeNull();
		});

		it("should match from array", function () {
			const document = jsdom(`
        <body>
          <div class="target" id="the-container">
            <div>
              <button id="el">click</button>
            </div>
          </div>
        </body>
      `);
			const el = document.getElementById("el");
			const match = getAncestorNodeByClass(el, ["other", "target"]);
			expect(match.id).toEqual("the-container");
		});

		it("should return body if it matches", function () {
			const document = jsdom(`
        <body class="target" id="the-container">
          <div>
            <div>
              <button id="el">click</button>
            </div>
          </div>
        </body>
      `);
			const el = document.getElementById("el");
			// compare ids for equality check
			expect(getAncestorNodeByClass(el, "target")?.id).toEqual("the-container");
		});
	});

	describe("getAncestorNode", function () {
		it("should find matching element", function () {
			const document = jsdom(`
        <body>
          <div id="foo_123">
            <div id="ignored_321">
              <button id="el">click</button>
            </div>
          </div>
        </body>
      `);
			const el = document.getElementById("el");
			const match = getAncestorNode(el, (e) => {
				return e.id.startsWith("foo_");
			});
			expect(match.id).toEqual("foo_123");
		});
	});
});
