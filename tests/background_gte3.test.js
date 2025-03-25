// Import our setup file
const { setupTestEnvironment, cleanup } = require('./setup');

afterAll(() => {
  cleanup();
});

describe('Background.js - Modern API /3.x or greater', () => {
  let testEnv;
  
  // Set up a fresh test environment before each test
  beforeEach(() => {
    testEnv = setupTestEnvironment();
    global.window = testEnv.dom.window; // Refresh window reference for each test
    
    // Spy on console methods for tests that need it
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  
  // Clean up after each test
  afterEach(() => {
    testEnv.cleanup();
    
    // Restore console mocks if they were used
    if (console.error.mockRestore) console.error.mockRestore();
    if (console.warn.mockRestore) console.warn.mockRestore();
    if (console.log.mockRestore) console.log.mockRestore();
  });
  
  // Tests for detectModelAndAPI
  describe('detectModelAndAPI', () => {
    test('should detect modern Claude 3.5+ format', () => {
      const modernMessage = {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Hello there' },
          { type: 'code', language: 'javascript', text: 'console.log("Hello")' }
        ]
      };
      
      const result = detectModelAndAPI(modernMessage);
      
      expect(result.version).toBe('modern');
      expect(result.useStructuredContent).toBe(true);
    });
    
    test('should detect Claude 3 format', () => {
      const claude3Message = {
        sender: 'assistant',
        text: 'Hello there',
        model: 'claude-3-opus'
      };
      
      const result = detectModelAndAPI(claude3Message);
      
      expect(result.version).toBe('claude-3');
      expect(result.model).toBe('claude-3-opus');
      expect(result.useStructuredContent).toBe(false);
    });
    
    test('should detect legacy format', () => {
      const legacyMessage = {
        sender: 'assistant',
        text: 'Hello there'
      };
      
      const result = detectModelAndAPI(legacyMessage);
      
      expect(result.version).toBe('legacy');
      expect(result.useStructuredContent).toBe(false);
    });
  });
  
  // Tests for extractStructuredArtifacts
  describe('extractStructuredArtifacts', () => {
    test('should extract code blocks from structured content', () => {
      const message = {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Here is a code example:' },
          { type: 'code', language: 'javascript', text: 'function hello() {\n  return "world";\n}' }
        ]
      };
      
      const artifacts = extractStructuredArtifacts(message);
      
      expect(artifacts).toHaveLength(1);
      expect(artifacts[0].title).toBe('code_block_1');
      expect(artifacts[0].language).toBe('javascript');
      expect(artifacts[0].content).toBe('function hello() {\n  return "world";\n}');
    });
    
    test('should extract multiple code blocks with correct indexing', () => {
      const message = {
        role: 'assistant',
        content: [
          { type: 'text', text: 'First example:' },
          { type: 'code', language: 'javascript', text: 'const x = 1;' },
          { type: 'text', text: 'Second example:' },
          { type: 'code', language: 'python', text: 'x = 1' }
        ]
      };
      
      const artifacts = extractStructuredArtifacts(message);
      
      expect(artifacts).toHaveLength(2);
      expect(artifacts[0].title).toBe('code_block_1');
      expect(artifacts[0].language).toBe('javascript');
      expect(artifacts[1].title).toBe('code_block_2');
      expect(artifacts[1].language).toBe('python');
    });
    
    test('should handle code blocks with titles in preceding text', () => {
      const message = {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Here is `app.js`:' },
          { type: 'code', language: 'javascript', text: 'const app = express();' },
          { type: 'text', text: 'And here is `styles.css`:' },
          { type: 'code', language: 'css', text: 'body { margin: 0; }' }
        ]
      };
      
      const artifacts = extractStructuredArtifacts(message);
      
      expect(artifacts).toHaveLength(2);
      expect(artifacts[0].title).toBe('app.js');
      expect(artifacts[1].title).toBe('styles.css');
    });
  });
  
  // Tests for fallbackArtifactExtraction
  describe('fallbackArtifactExtraction', () => {
    test('should extract artifacts when primary method fails', () => {
      const ambiguousMessage = {
        text: 'Here is some code: ```javascript\nconst x = 1;\n```'
      };
      
      const artifacts = fallbackArtifactExtraction(ambiguousMessage);
      
      expect(artifacts).toHaveLength(1);
      expect(artifacts[0].language).toBe('javascript');
      expect(artifacts[0].content).toBe('const x = 1;');
    });
    
    test('should extract from markdown code blocks', () => {
      const markdownText = 'Code example:\n```python\nprint("Hello")\n```';
      
      const artifacts = fallbackArtifactExtraction(markdownText);
      
      expect(artifacts).toHaveLength(1);
      expect(artifacts[0].language).toBe('python');
      expect(artifacts[0].content).toBe('print("Hello")');
    });
  });
  
  // Tests for extractAllArtifacts
  describe('extractAllArtifacts', () => {
    test('should use structured extraction for modern format', () => {
      const modernMessage = {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Here is code:' },
          { type: 'code', language: 'javascript', text: 'const x = 1;' }
        ]
      };
      
      const artifacts = extractAllArtifacts(modernMessage);
      
      expect(artifacts).toHaveLength(1);
      expect(artifacts[0].language).toBe('javascript');
      expect(artifacts[0].content).toBe('const x = 1;');
    });
    
    test('should use legacy extraction for older formats', () => {
      const legacyMessage = {
        sender: 'assistant',
        text: '<antArtifact title="test" language="javascript">const x = 1;</antArtifact>'
      };
      
      const artifacts = extractAllArtifacts(legacyMessage);
      
      expect(artifacts).toHaveLength(1);
      expect(artifacts[0].title).toBe('test');
      expect(artifacts[0].language).toBe('javascript');
      expect(artifacts[0].content).toBe('const x = 1;');
    });
    
    test('should attempt fallback extraction when needed', () => {
      // A message with ambiguous format but containing code blocks
      const ambiguousMessage = {
        sender: 'assistant',
        text: 'Here is code:\n```javascript\nconst x = 1;\n```'
      };
      
      const artifacts = extractAllArtifacts(ambiguousMessage);
      
      expect(artifacts.length).toBeGreaterThan(0);
      expect(artifacts[0].language).toBe('javascript');
    });
  });
}); 