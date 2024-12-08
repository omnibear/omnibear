import {assert} from 'chai';
import {jsdom} from 'jsdom';
import {getAncestorNode, getAncestorNodeByClass} from './dom';

describe('page/dom', function() {
  describe('getAncestorNodeByClass', function() {
    it('should find container node', function() {
      const document = jsdom(`
        <body>
          <div class="target" id="the-container">
            <div>
              <button id="el">click</button>
            </div>
          </div>
        </body>
      `);
      const el = document.getElementById('el');
      // compare ids for equality check
      assert.equal(getAncestorNodeByClass(el, 'target').id, 'the-container');
    });

    it('should find return null if not found', function() {
      const document = jsdom(`
        <body>
          <div>
            <div>
              <button id="el">click</button>
            </div>
          </div>
        </body>
      `);
      const el = document.getElementById('el');
      assert.isNull(getAncestorNodeByClass(el, 'target'));
    });

    it('should not find find target if not a direct ancestor', function() {
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
      const el = document.getElementById('el');
      assert.isNull(getAncestorNodeByClass(el, 'target'));
    });

    it('should match from array', function() {
      const document = jsdom(`
        <body>
          <div class="target" id="the-container">
            <div>
              <button id="el">click</button>
            </div>
          </div>
        </body>
      `);
      const el = document.getElementById('el');
      const match = getAncestorNodeByClass(el, ['other', 'target']);
      assert.equal(match.id, 'the-container');
    });

    it('should return body if it matches', function() {
      const document = jsdom(`
        <body class="target" id="the-container">
          <div>
            <div>
              <button id="el">click</button>
            </div>
          </div>
        </body>
      `);
      const el = document.getElementById('el');
      // compare ids for equality check
      assert.equal(getAncestorNodeByClass(el, 'target').id, 'the-container');
    });
  });

  describe('getAncestorNode', function() {
    it('should find matching element', function() {
      const document = jsdom(`
        <body>
          <div id="foo_123">
            <div id="ignored_321">
              <button id="el">click</button>
            </div>
          </div>
        </body>
      `);
      const el = document.getElementById('el');
      const match = getAncestorNode(el, e => {
        return e.id.startsWith('foo_');
      });
      assert.equal(match.id, 'foo_123');
    });
  });
});
