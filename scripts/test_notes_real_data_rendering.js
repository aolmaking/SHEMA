const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const notesJs = fs.readFileSync('windows/js/notes.js', 'utf8');
const userNotesData = JSON.parse(fs.readFileSync('C:/Users/ahmed/AppData/Roaming/mirqat-widgets/notes.json', 'utf8'));

let editorElement = {
  innerHTML: '',
  textContent: '',
  attributes: {},
  addEventListener: () => {},
  removeEventListener: () => {},
  setAttribute(k, v) { this.attributes[k] = v; },
  getAttribute(k) { return this.attributes[k]; },
  classList: {
    classes: new Set(),
    add(c) { this.classes.add(c); },
    remove(c) { this.classes.delete(c); },
    toggle(c, force) { if (force) this.classes.add(c); else this.classes.delete(c); },
    contains(c) { return this.classes.has(c); },
  },
  style: {},
  focus() {},
  blur() {},
  scrollTop: 0,
};

let titleElement = { textContent: '' };
let metaElement = { textContent: '', classList: { add() {}, remove() {} } };
let subElement = { textContent: '' };

const dom = {
  window: {
    addEventListener: () => {},
    removeEventListener: () => {},
    getSelection: () => null,
  },
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: (sel) => {
      if (sel === '#editor') return editorElement;
      if (sel === '#title') return titleElement;
      if (sel === '#meta') return metaElement;
      if (sel === '#sub') return subElement;
      return null;
    },
    getElementById: (id) => dom.document.querySelector('#' + id),
    queryCommandState: () => false,
    queryCommandValue: () => '',
    execCommand: () => true,
    activeElement: null,
    dir: 'rtl',
    documentElement: { dir: 'rtl' },
  },
  navigator: {},
  localStorage: { getItem: () => null, setItem: () => {} },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  console: console,
  Date: Date,
  Math: Math,
  JSON: JSON,
  Array: Array,
  Object: Object,
  String: String,
  Number: Number,
  Boolean: Boolean,
  RegExp: RegExp,
  Error: Error,
};

dom.window.UI = {
  $: (sel) => dom.document.querySelector(sel) || {
    append: () => {},
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    setAttribute: () => {},
    style: {},
    focus: () => {},
    blur: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    replaceChildren: () => {},
    hidden: false,
    value: '',
    innerHTML: '',
    textContent: '',
  },
  el: (tag, attrs, ...children) => ({
    tagName: tag,
    attrs,
    children,
    append: () => {},
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    setAttribute: () => {},
    style: {},
  }),
  icon: () => ({}),
  boot: (fn) => fn(),
  closeWindow: () => {},
  uid: () => 'test_uid',
  timeAgo: () => '1m ago',
  debounce: (fn) => fn,
  t: (k) => k,
  translate: () => {},
  strings: () => ({}),
  digits: (n) => String(n),
  confirmDelete: () => Promise.resolve(true),
};

dom.window.widgets = {
  notes: {
    get: async () => ({ items: userNotesData.items, activeId: 'mvo1e7v3-y7d7s6' }),
    set: async () => {},
    onChange: () => {},
  },
  win: {
    openSettings: () => {},
  },
  settings: {
    onChange: () => {},
  },
};

const context = vm.createContext(dom);
vm.runInContext(notesJs, context);

setTimeout(() => {
  console.log('Testing editor rendering with user real note mvo1e7v3-y7d7s6...');
  console.log('Title rendered:', titleElement.textContent);
  console.log('Meta rendered:', metaElement.textContent);
  console.log('Editor innerHTML length:', editorElement.innerHTML.length);
  assert(editorElement.innerHTML.length > 500, 'Editor innerHTML must be populated with user note content!');
  assert(editorElement.innerHTML.includes('التطوير'), 'Editor must contain التطوير text!');
  assert(editorElement.innerHTML.includes('habits tracker'), 'Editor must contain habits tracker text!');
  console.log('✅ PASS: Real user note content verified completely rendered in editor!');
}, 50);
