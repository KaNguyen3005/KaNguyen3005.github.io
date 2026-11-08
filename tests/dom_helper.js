/**
 * tests/dom_helper.js
 * Lightweight, zero-dependency HTML parser and DOM abstraction for E2E opaque-box testing.
 * Linear-time parsing (O(N)), guaranteed zero ReDoS.
 */

const fs = require('node:fs');
const path = require('node:path');

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

class ClassList {
  constructor(element) {
    this.element = element;
  }

  _getClasses() {
    const cls = this.element.getAttribute('class') || '';
    return cls.trim().split(/\s+/).filter(Boolean);
  }

  _setClasses(arr) {
    this.element.setAttribute('class', arr.join(' '));
  }

  contains(className) {
    return this._getClasses().includes(className);
  }

  add(...classNames) {
    const set = new Set(this._getClasses());
    for (const c of classNames) {
      if (c) set.add(c);
    }
    this._setClasses([...set]);
  }

  remove(...classNames) {
    const set = new Set(this._getClasses());
    for (const c of classNames) {
      set.delete(c);
    }
    this._setClasses([...set]);
  }

  toggle(className, force) {
    const has = this.contains(className);
    if (typeof force === 'boolean') {
      if (force) this.add(className);
      else this.remove(className);
      return force;
    }
    if (has) {
      this.remove(className);
      return false;
    } else {
      this.add(className);
      return true;
    }
  }

  toString() {
    return this.element.getAttribute('class') || '';
  }
}

class DOMElement {
  constructor(tagName) {
    this.tagName = (tagName || 'div').toUpperCase();
    this.attributes = Object.create(null);
    this.children = [];
    this.parentElement = null;
    this._directText = '';
    this._rawInnerHTML = '';
    this.eventListeners = Object.create(null);
    this.classList = new ClassList(this);
    this.style = Object.create(null);
  }

  get id() {
    return this.getAttribute('id') || '';
  }

  set id(val) {
    this.setAttribute('id', val);
  }

  get className() {
    return this.getAttribute('class') || '';
  }

  set className(val) {
    this.setAttribute('class', val);
  }

  get textContent() {
    let result = this._directText || '';
    for (const child of this.children) {
      const childText = child.textContent;
      if (childText) {
        result = result ? `${result} ${childText}` : childText;
      }
    }
    return result;
  }

  set textContent(val) {
    this._directText = String(val);
  }

  get innerHTML() {
    if (this._rawInnerHTML) return this._rawInnerHTML;
    return this.children.map(c => c.outerHTML).join('') + this.textContent;
  }

  set innerHTML(val) {
    this._rawInnerHTML = val;
    if (val === '') {
      this.children = [];
      this.textContent = '';
    }
  }

  get outerHTML() {
    const tag = this.tagName.toLowerCase();
    const attrs = Object.entries(this.attributes)
      .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${String(v).replace(/"/g, '&quot;')}"`))
      .join('');
    if (VOID_ELEMENTS.has(tag)) {
      return `<${tag}${attrs} />`;
    }
    return `<${tag}${attrs}>${this.innerHTML}</${tag}>`;
  }

  getAttribute(name) {
    if (!name) return null;
    const lower = name.toLowerCase();
    return this.attributes[lower] !== undefined ? this.attributes[lower] : null;
  }

  setAttribute(name, value) {
    if (!name) return;
    const lower = name.toLowerCase();
    this.attributes[lower] = String(value);
  }

  hasAttribute(name) {
    if (!name) return false;
    return this.attributes[name.toLowerCase()] !== undefined;
  }

  removeAttribute(name) {
    if (!name) return;
    delete this.attributes[name.toLowerCase()];
  }

  addEventListener(type, callback) {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }
    this.eventListeners[type].push(callback);
  }

  removeEventListener(type, callback) {
    if (!this.eventListeners[type]) return;
    this.eventListeners[type] = this.eventListeners[type].filter(cb => cb !== callback);
  }

  dispatchEvent(event) {
    const type = typeof event === 'string' ? event : event.type;
    const evt = typeof event === 'string' ? { type: event, target: this, currentTarget: this } : event;
    evt.target = evt.target || this;
    evt.currentTarget = this;
    let stopped = false;
    evt.stopPropagation = () => { stopped = true; };
    evt.preventDefault = () => { evt.defaultPrevented = true; };

    const cbs = [...(this.eventListeners[type] || [])];
    for (const cb of cbs) {
      cb.call(this, evt);
    }

    if (!stopped && this.parentElement && evt.bubbles !== false) {
      this.parentElement.dispatchEvent(evt);
    }
    return !evt.defaultPrevented;
  }

  click() {
    this.dispatchEvent({ type: 'click', bubbles: true, cancelable: true });
  }

  contains(other) {
    if (!other) return false;
    let curr = other;
    while (curr) {
      if (curr === this) return true;
      curr = curr.parentElement;
    }
    return false;
  }

  focus() {}
  blur() {}

  _matchesSingle(simpleSelector) {
    let sel = simpleSelector.trim();
    if (!sel || sel === '*') return true;

    // Attribute selector [attr=val]
    const attrMatch = sel.match(/^([a-zA-Z0-9_-]*)\[([a-zA-Z0-9_-]+)(?:([*^$~|]?=)(["']?)(.*?)\4)?\]$/);
    if (attrMatch) {
      const [, tag, attrName, op, , attrVal] = attrMatch;
      if (tag && tag.toUpperCase() !== this.tagName) return false;
      if (!this.hasAttribute(attrName)) return false;
      if (!op) return true;
      const actualVal = this.getAttribute(attrName);
      if (op === '=') return actualVal === attrVal;
      if (op === '^=') return actualVal.startsWith(attrVal);
      if (op === '$=') return actualVal.endsWith(attrVal);
      if (op === '*=') return actualVal.includes(attrVal);
      if (op === '~=') return actualVal.split(/\s+/).includes(attrVal);
      return false;
    }

    // ID selector #id
    if (sel.startsWith('#')) {
      return this.id === sel.slice(1);
    }

    // Tag and ID combination: tag#id
    const tagIdMatch = sel.match(/^([a-zA-Z0-9_-]+)#([a-zA-Z0-9_-]+)$/);
    if (tagIdMatch) {
      return this.tagName === tagIdMatch[1].toUpperCase() && this.id === tagIdMatch[2];
    }

    // Class selector .class or tag.class or tag.class1.class2
    if (sel.includes('.')) {
      const parts = sel.split('.');
      const tagPart = parts[0];
      const classes = parts.slice(1);
      if (tagPart && tagPart.toUpperCase() !== this.tagName) return false;
      return classes.every(c => this.classList.contains(c));
    }

    // Pure tag
    return this.tagName === sel.toUpperCase();
  }

  matches(selector) {
    if (!selector) return false;
    const orParts = selector.split(',').map(s => s.trim());
    for (const part of orParts) {
      if (this._matchesComplex(part)) return true;
    }
    return false;
  }

  closest(selector) {
    let current = this;
    while (current && current.tagName !== '#DOCUMENT') {
      if (current.matches && current.matches(selector)) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  _matchesComplex(selector) {
    const tokens = selector.trim().split(/\s+/);
    if (tokens.length === 1) {
      return this._matchesSingle(tokens[0]);
    }
    const lastToken = tokens[tokens.length - 1];
    if (!this._matchesSingle(lastToken)) return false;

    let current = this.parentElement;
    for (let i = tokens.length - 2; i >= 0; i--) {
      const token = tokens[i];
      if (token === '>') {
        i--;
        const parentToken = tokens[i];
        if (!current || !current._matchesSingle(parentToken)) return false;
        current = current.parentElement;
      } else {
        let found = false;
        while (current) {
          if (current._matchesSingle(token)) {
            found = true;
            current = current.parentElement;
            break;
          }
          current = current.parentElement;
        }
        if (!found) return false;
      }
    }
    return true;
  }

  querySelector(selector) {
    const list = this.querySelectorAll(selector);
    return list.length > 0 ? list[0] : null;
  }

  querySelectorAll(selector) {
    const results = [];
    const traverse = (node) => {
      for (const child of node.children) {
        if (child.matches(selector)) {
          results.push(child);
        }
        traverse(child);
      }
    };
    traverse(this);
    return results;
  }
}

class DOMDocument extends DOMElement {
  constructor() {
    super('#document');
    this.body = null;
    this.head = null;
  }

  getElementById(id) {
    if (!id) return null;
    return this.querySelector(`#${id}`);
  }

  getElementsByTagName(tag) {
    return this.querySelectorAll(tag);
  }

  getElementsByClassName(className) {
    return this.querySelectorAll(`.${className}`);
  }
}

/**
 * Fast, linear-time HTML parser
 */
function parseHTML(htmlString) {
  const doc = new DOMDocument();
  let current = doc;
  const stack = [doc];

  // Remove HTML comments
  const cleanHtml = htmlString.replace(/<!--[\s\S]*?-->/g, '');

  // Tag matcher: linear scan, zero backtracking
  const tagRegex = /<(\/)?([a-zA-Z0-9:-]+)([^>]*)>/g;
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(cleanHtml)) !== null) {
    const isClosing = match[1] === '/';
    const tagName = match[2];
    let rawAttrs = match[3] || '';
    const textBetween = cleanHtml.slice(lastIndex, match.index).trim();

    if (textBetween && current !== doc) {
      current._directText = (current._directText ? current._directText + ' ' : '') + textBetween;
    }
    lastIndex = tagRegex.lastIndex;

    const lowerTag = tagName.toLowerCase();

    // Check for self-closing slash at end of rawAttrs
    let isSelfClosing = false;
    if (rawAttrs.endsWith('/')) {
      isSelfClosing = true;
      rawAttrs = rawAttrs.slice(0, -1);
    }

    if (isClosing) {
      for (let i = stack.length - 1; i >= 1; i--) {
        if (stack[i].tagName.toLowerCase() === lowerTag) {
          while (stack.length > i) {
            stack.pop();
          }
          current = stack[stack.length - 1];
          break;
        }
      }
    } else {
      const elem = new DOMElement(lowerTag);
      elem.parentElement = current;

      // Linear attribute parser
      if (rawAttrs.trim()) {
        const attrRegex = /([a-zA-Z0-9:_.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
          const attrName = attrMatch[1].toLowerCase();
          const attrValue = attrMatch[2] !== undefined ? attrMatch[2] :
                            attrMatch[3] !== undefined ? attrMatch[3] :
                            attrMatch[4] !== undefined ? attrMatch[4] : true;
          elem.setAttribute(attrName, attrValue);
        }
      }

      current.children.push(elem);

      if (lowerTag === 'body') doc.body = elem;
      if (lowerTag === 'head') doc.head = elem;

      const isVoid = VOID_ELEMENTS.has(lowerTag) || isSelfClosing;
      if (!isVoid) {
        stack.push(elem);
        current = elem;
      }
    }
  }

  return doc;
}

function loadDOM(filePath) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const document = parseHTML(content);

  const window = {
    document,
    location: {
      href: 'http://localhost:8080/index.html',
      hash: '',
    },
    addEventListener: (type, cb) => document.addEventListener(type, cb),
    removeEventListener: (type, cb) => document.removeEventListener(type, cb),
    dispatchEvent: (evt) => document.dispatchEvent(evt),
    innerWidth: 1920,
    innerHeight: 1080,
    scrollY: 0,
    scrollTo: (x, y) => { window.scrollY = y; },
    matchMedia: (query) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {}
    }),
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clearTimeout(id)
  };

  // Execute local client scripts linked via <script src="...">
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    const src = script.getAttribute('src');
    if (src && !src.startsWith('http') && !src.startsWith('//')) {
      const scriptPath = path.resolve(path.dirname(fullPath), src);
      if (fs.existsSync(scriptPath)) {
        try {
          const code = fs.readFileSync(scriptPath, 'utf8');
          const fn = new Function('window', 'document', 'setTimeout', 'clearTimeout', code);
          fn(window, document, (cb, d) => setTimeout(cb, d || 0), (id) => clearTimeout(id));
        } catch (err) {
          // ignore script evaluation error
        }
      }
    }
  }

  return { window, document, rawHTML: content };
}

module.exports = {
  DOMElement,
  DOMDocument,
  ClassList,
  parseHTML,
  loadDOM
};
