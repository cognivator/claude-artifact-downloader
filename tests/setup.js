// Set up JSDOM environment for tests
const fs = require('fs');
const path = require('path');
const { TextEncoder, TextDecoder } = require('util');

// Add TextEncoder to the global scope (Node.js polyfill for JSDOM)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');

// Create a function to set up a fresh JSDOM environment for each test
function setupTestEnvironment() {
  // Create a new JSDOM instance
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://claude.ai/chat/123e4567-e89b-12d3-a456-426614174000',
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    resources: 'usable'
  });

  // Set up global variables from JSDOM
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.Element = dom.window.Element;

  // Mock importScripts function - needed by service workers
  window.importScripts = function() {
    // No-op implementation
    console.log('Mock importScripts called with:', [...arguments]);
  };

  // Mock Chrome API for unit testing
  global.chrome = window.chrome = {
    runtime: {
      onMessage: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      },
      sendMessage: jest.fn(),
      lastError: null
    },
    storage: {
      local: {
        get: jest.fn(),
        set: jest.fn()
      }
    },
    tabs: {
      sendMessage: jest.fn(),
      onUpdated: {
        addListener: jest.fn()
      }
    },
    downloads: {
      download: jest.fn()
    },
    webRequest: {
      onBeforeSendHeaders: {
        addListener: jest.fn()
      }
    }
  };

  // Add JSZip mock
  global.JSZip = window.JSZip = class JSZip {
    constructor() {
      this.files = {};
    }

    file(path, content) {
      this.files[path] = content;
      return this;
    }

    generateAsync() {
      return Promise.resolve(new Blob(['mocked_zip_content']));
    }
  };

  // Mock FileReader
  window.FileReader = class FileReader {
    constructor() {
      this.result = null;
      this.onload = null;
    }

    readAsArrayBuffer(blob) {
      this.result = new ArrayBuffer(10);
      setTimeout(() => {
        if (this.onload) {
          this.onload({ target: { result: this.result } });
        }
      }, 0);
    }
  };

  // Mock fetch API
  window.fetch = jest.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        uuid: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Chat",
        chat_messages: []
      })
    })
  );

  // Mock URL
  window.URL = {
    createObjectURL: jest.fn(() => 'mocked-url'),
    revokeObjectURL: jest.fn()
  };

  // Mock Blob
  window.Blob = class Blob {
    constructor(content, options) {
      this.content = content;
      this.options = options;
      this.size = 100;
    }
  };

  // Add btoa to global scope for arrayBufferToBase64 function tests
  window.btoa = (str) => Buffer.from(str).toString('base64');

  // Load background.js into the JSDOM environment
  try {
    const backgroundPath = path.resolve(__dirname, '../background.js');
    const backgroundJs = fs.readFileSync(backgroundPath, 'utf8');

    // Create a script element and inject the code
    const scriptEl = document.createElement('script');
    scriptEl.textContent = backgroundJs;
    document.body.appendChild(scriptEl);
  } catch (error) {
    console.error('Error loading background.js:', error);
    throw new Error(`Failed to load background.js: ${error.message}`);
  }

  return {
    dom,
    cleanup: () => {
      dom.window.close();
    }
  };
}

// Set up the environment immediately for tests that import this module
const { dom, cleanup } = setupTestEnvironment();

// Export the cleanup function and setup function for use in tests
module.exports = {
  cleanup,
  setupTestEnvironment
}; 