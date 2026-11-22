const fs = require('fs');
const vm = require('vm');

const notesJs = fs.readFileSync('windows/js/notes.js', 'utf8');

// Mock browser/DOM environment
const dom = {
  window: {
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    getElementById: () => null,
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
  TypeError: TypeError,
  RangeError: RangeError,
};

// Mock UI
dom.window.UI = {
  $: () => ({
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
  }),
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
    get: async () => ({ items: [], activeId: null }),
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
try {
  vm.runInContext(notesJs, context);
  console.log('🎉 SUCCESS: notes.js evaluated and ran top-to-bottom with ZERO errors!');
} catch (err) {
  console.error('Error evaluating notes.js:', err);
  process.exit(1);
}
