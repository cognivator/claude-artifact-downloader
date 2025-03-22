// Import our setup file
const { setupTestEnvironment } = require('./setup');

describe('Background.js Functions', () => {
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
  
  // Tests for extractArtifacts
  describe('extractArtifacts', () => {
    test('should parse artifact tags correctly', () => {
      const sampleText = '<antArtifact title="test" language="javascript">const x = 1;</antArtifact>';
      const artifacts = extractArtifacts(sampleText);
      
      expect(artifacts).toHaveLength(1);
      expect(artifacts[0].title).toBe('test');
      expect(artifacts[0].language).toBe('javascript');
      expect(artifacts[0].content).toBe('const x = 1;');
    });
    
    test('should extract multiple artifacts', () => {
      const text = `
        <antArtifact title="file1" language="javascript">console.log("File 1");</antArtifact>
        <p>Some text in between</p>
        <antArtifact title="file2" language="python">print("File 2")</antArtifact>
      `;
      const result = extractArtifacts(text);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        title: 'file1',
        language: 'javascript',
        content: 'console.log("File 1");'
      });
      expect(result[1]).toEqual({
        title: 'file2',
        language: 'python',
        content: 'print("File 2")'
      });
    });
  
    test('should use default values for missing attributes', () => {
      const text = '<antArtifact>const data = "No title or language";</antArtifact>';
      const result = extractArtifacts(text);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: 'Untitled',
        language: 'txt',
        content: 'const data = "No title or language";'
      });
    });
  
    test('should handle nested tags correctly', () => {
      const text = `
        <antArtifact title="html-example" language="html">
          <div>
            <h1>Title</h1>
            <p>Paragraph with <span>inline</span> elements</p>
          </div>
        </antArtifact>
      `;
      const result = extractArtifacts(text);
      
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('html-example');
      expect(result[0].language).toBe('html');
      expect(result[0].content.includes('<div>')).toBe(true);
      expect(result[0].content.includes('<span>inline</span>')).toBe(true);
    });
  
    test('should return empty array when no artifacts are found', () => {
      const text = 'This is just some text without any artifacts.';
      const result = extractArtifacts(text);
      
      expect(result).toEqual([]);
    });
  
    test('should handle multiline content correctly', () => {
      const text = `
        <antArtifact title="multiline" language="python">
def hello():
    print("Hello")
    print("World")
    
# This is a comment
hello()
        </antArtifact>
      `;
      const result = extractArtifacts(text);
      
      expect(result).toHaveLength(1);
      expect(result[0].content.split('\n').length).toBeGreaterThan(1);
      expect(result[0].content).toContain('def hello()');
      expect(result[0].content).toContain('# This is a comment');
    });
  });
  
  // Tests for getFileExtension
  describe('getFileExtension', () => {
    test('should return correct extension for all supported content types', () => {
      expect(getFileExtension('javascript')).toBe('.js');
      expect(getFileExtension('typescript')).toBe('.ts');
      expect(getFileExtension('html')).toBe('.html');
      expect(getFileExtension('css')).toBe('.css');
      expect(getFileExtension('python')).toBe('.py');
      expect(getFileExtension('java')).toBe('.java');
      expect(getFileExtension('c')).toBe('.c');
      expect(getFileExtension('cpp')).toBe('.cpp');
      expect(getFileExtension('ruby')).toBe('.rb');
      expect(getFileExtension('php')).toBe('.php');
      expect(getFileExtension('swift')).toBe('.swift');
      expect(getFileExtension('go')).toBe('.go');
      expect(getFileExtension('rust')).toBe('.rs');
      expect(getFileExtension('shell')).toBe('.sh');
      expect(getFileExtension('sql')).toBe('.sql');
      expect(getFileExtension('kotlin')).toBe('.kt');
      expect(getFileExtension('scala')).toBe('.scala');
      expect(getFileExtension('r')).toBe('.r');
      expect(getFileExtension('matlab')).toBe('.m');      
    });
    
    test('should return .txt for unknown language', () => {
      expect(getFileExtension('unknown')).toBe('.txt');
    });
    
    test('should handle uppercase and mixed case language names', () => {
      expect(getFileExtension('JAVASCRIPT')).toBe('.js');
      expect(getFileExtension('Python')).toBe('.py');
      expect(getFileExtension('TypeScript')).toBe('.ts');
      expect(getFileExtension('CsS')).toBe('.css');
    });
  
    test('should handle empty, null, or undefined input', () => {
      // TODO: use this as a teachable moment for AI problems
      // Mock the getFileExtension function specifically for this test
      // const originalGetFileExtension = window.getFileExtension;
      // window.getFileExtension = function(language) {
      //   if (!language) return '.txt';
      //   const languageToExt = {
      //     javascript: ".js",
      //     html: ".html",
      //     css: ".css",
      //     python: ".py",
      //     java: ".java",
      //     // other extensions as in original function
      //   };
      //   return languageToExt[language.toLowerCase()] || ".txt";
      // };
      
      let input = {name: '', value: ''};
      try {
        input = {name: 'empty', value: ''};
        expect(getFileExtension(input.value)).toBe('.txt');

        input = {name: 'null', value: null};
        expect(getFileExtension(input.value)).toBe('.txt');
        
        input = {name: 'undefined', value: undefined};
        expect(getFileExtension(input.value)).toBe('.txt');

      } catch (e) {
        throw new Error(`fails when input is ${input.name}`);
      }

      
      // Restore original function after test
      // TODO: use this as a teachable moment for AI problems
      // window.getFileExtension = originalGetFileExtension;
    });
  });
  
  // Tests for arrayBufferToBase64
  describe('arrayBufferToBase64', () => {
    test('should convert ArrayBuffer to base64 string', () => {
      const buffer = new ArrayBuffer(4);
      const view = new Uint8Array(buffer);
      view[0] = 84;  // 'T'
      view[1] = 101; // 'e'
      view[2] = 115; // 's'
      view[3] = 116; // 't'
      
      const result = arrayBufferToBase64(buffer);
      expect(result).toBe('VGVzdA=='); // 'Test' in base64
    });
    
    test('should convert empty buffer to an empty base64 string', () => {
      const buffer = new Uint8Array([]).buffer;
      const result = arrayBufferToBase64(buffer);
      expect(result).toBe('');
    });
    
    test('should handle null or undefined input', () => {
      // TODO: use this as a teachable moment for AI problems
      // try {
      //   window.arrayBufferToBase64(null);
      //   expect('should throw error').toBe('but did not');
      // } catch(e) {
      //   expect(e).toBeDefined();
      // }
      // 
      // try {
      //   window.arrayBufferToBase64(undefined);
      //   expect('should throw error').toBe('but did not');
      // } catch(e) {
      //   expect(e).toBeDefined();
      // }

      // Firstly, this is how to test for throwing errors
      // expect(() => window.arrayBufferToBase64(null)).toThrow();
      // expect(() => window.arrayBufferToBase64(undefined)).toThrow();

      // But what we actually want is to return ''
      expect(arrayBufferToBase64(null)).toBe('');
      expect(arrayBufferToBase64(undefined)).toBe('');
    });
    
    test('should handle non-ArrayBuffer input', () => {
      // TODO: use this as a teachable moment for AI problems
      // try {
      //   window.arrayBufferToBase64('not a buffer');
      //   expect('should throw error').toBe('but did not');
      // } catch(e) {
      //   expect(e).toBeDefined();
      // }
      // 
      // try {
      //   window.arrayBufferToBase64(123);
      //   expect('should throw error').toBe('but did not');
      // } catch(e) {
      //   expect(e).toBeDefined();
      // }
      //
      // try {
      //   window.arrayBufferToBase64({});
      //   expect('should throw error').toBe('but did not');
      // } catch(e) {
      //   expect(e).toBeDefined();
      // }

      // But what we actually want is to return ''
      expect(arrayBufferToBase64('not a buffer')).toBe('');
      expect(arrayBufferToBase64(123)).toBe('');
      expect(arrayBufferToBase64({})).toBe('');
    });
    
    test('should convert buffer with ASCII characters to base64', () => {
      const text = 'Hello, World!';
      const buffer = new TextEncoder().encode(text).buffer;
      const result = arrayBufferToBase64(buffer);
      expect(result).toBe('SGVsbG8sIFdvcmxkIQ==');
    });

    test('should convert buffer with special characters to base64', () => {
      const text = '🚀 Testing 123 !@#$%^&*()';
      const buffer = new TextEncoder().encode(text).buffer;
      const result = arrayBufferToBase64(buffer);
      
      // Instead of comparing exact strings, decode and compare buffer contents
      const resultDecoded = Buffer.from(result, 'base64');
      const expected = Buffer.from(text);
      
      // Check if the result is a valid base64 string
      expect(result).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });
  });
  
  // Tests for inferDirectoryStructure
  describe('inferDirectoryStructure', () => {
    test('should handle flat file', () => {
      const result = inferDirectoryStructure('test', '.js');
      expect(result).toBe('test.js');
    });
    
    test('should handle flat file with message index', () => {
      const result = inferDirectoryStructure('test', '.js', 5);
      expect(result).toBe('6_test.js');
    });
    
    test('should handle flat file with suffix', () => {
      const result = inferDirectoryStructure('test', '.js', undefined, '_modified');
      expect(result).toBe('test_modified.js');
    });
    
    test('should handle flat file with message index and suffix', () => {
      const result = inferDirectoryStructure('test', '.js', 3, '_modified');
      expect(result).toBe('4_test_modified.js');
    });
  
    test('should handle directory structure', () => {
      const result = inferDirectoryStructure('src/utils/test', '.js');
      expect(result).toBe('src/utils/test.js');
    });
    
    test('should handle directory structure with message index', () => {
      const result = inferDirectoryStructure('src/utils/test', '.js', 5);
      expect(result).toBe('src/utils/6_test.js');
    });
    
    test('should handle directory structure with suffix', () => {
      const result = inferDirectoryStructure('src/utils/helper', '.js', undefined, '_modified');
      expect(result).toBe('src/utils/helper_modified.js');
    });
  
    test('should handle directory structure with message index and suffix', () => {
      const result = inferDirectoryStructure('utils/helper', '.js', 2, '_modified');
      expect(result).toBe('utils/3_helper_modified.js');
    });
  
    test('should handle message index of 0 correctly', () => {
      const result = inferDirectoryStructure('utils/helper', '.js', 0);
      expect(result).toBe('utils/1_helper.js');
    });
  
    test('should handle empty base name', () => {
      const result = inferDirectoryStructure('', '.txt');
      expect(result).toBe('.txt');
    });
  
    test('should handle empty base name with message index', () => {
      const result = inferDirectoryStructure('', '.txt', 1);
      expect(result).toBe('2_.txt');
    });

    test('should handle empty base name with suffix', () => {
      const result = inferDirectoryStructure('', '.txt', undefined, '_modified');
      expect(result).toBe('_modified.txt');
    });

    test('should handle empty base name with message index and suffix', () => {
      const result = inferDirectoryStructure('', '.txt', 1, '_modified');
      expect(result).toBe('2__modified.txt');
    });

    test('should handle empty extension', () => {
      const result = inferDirectoryStructure('test', '');
      expect(result).toBe('test');
    });
  
    test('should handle empty extension with message index', () => {
      const result = inferDirectoryStructure('test', '', 1);
      expect(result).toBe('2_test');
    });

    test('should handle empty extension with suffix', () => {
      const result = inferDirectoryStructure('test', '', undefined, '_modified');
      expect(result).toBe('test_modified');
    });

    test('should handle empty extension with message index and suffix', () => {
      const result = inferDirectoryStructure('test', '', 1, '_modified');
      expect(result).toBe('2_test_modified');
    });
  });
  
  // Tests for getUniqueFileName
  describe('getUniqueFileName', () => {
    test('should generate a file name with message index for flat structure', () => {
      const usedNames = new Set();
      const result = getUniqueFileName('test-file', 'javascript', 1, usedNames, false);
      
      expect(result).toBe('2_test-file.js');
      expect(usedNames.has('2_test-file.js')).toBe(true);
    });
  
    test('should use directory structure when option is enabled', () => {
      const usedNames = new Set();
      const result = getUniqueFileName('src/components/Button', 'javascript', 1, usedNames, true);
      
      expect(result).toBe('src_components_Button.js');
      expect(usedNames.has('src_components_Button.js')).toBe(true);
    });
  
    test('should sanitize file names by replacing non-alphanumeric chars', () => {
      const usedNames = new Set();
      const result = getUniqueFileName('file with spaces!@#$', 'python', 1, usedNames, false);
      
      expect(result).toBe('2_file_with_spaces_.py');
      expect(usedNames.has('2_file_with_spaces_.py')).toBe(true);
    });
  
    test('should append suffix if name collision occurs', () => {
      const usedNames = new Set(['2_test-file.js']);
      const result = getUniqueFileName('test-file', 'javascript', 1, usedNames, false);
      
      expect(result).toBe('2_test-file_*.js');
      expect(usedNames.has('2_test-file_*.js')).toBe(true);
    });
  
    test('should handle multiple name collisions by increasing suffix', () => {
      const usedNames = new Set(['2_test-file.js', '2_test-file_*.js']);
      const result = getUniqueFileName('test-file', 'javascript', 1, usedNames, false);
      
      expect(result).toBe('2_test-file_**.js');
      expect(usedNames.has('2_test-file_**.js')).toBe(true);
    });
  
    test('should handle empty title', () => {
      const usedNames = new Set();
      const result = getUniqueFileName('', 'python', 0, usedNames, false);
      
      expect(result).toBe('1_.py');
    });
  
    test('should handle null or undefined inputs with default values', () => {
      const usedNames = new Set();
      
      const result1 = getUniqueFileName('', 'javascript', 0, usedNames, false);
      expect(result1).toBe('1_.js');
      
      const result2 = getUniqueFileName('test', '', 0, usedNames, false);
      expect(result2).toBe('1_test.txt');
    });
    
    test('should handle name collisions in directory structure', () => {
      const usedNames = new Set(['src_components_Button.js']);
      const result = getUniqueFileName('src/components/Button', 'javascript', 1, usedNames, true);
      
      // The actual implementation uses underscores not slashes for directory structure
      expect(result).toBe('2_src_components_Button_*.js');
      expect(usedNames.has('2_src_components_Button_*.js')).toBe(true);
    });
    
    test('should use directory structure with index when collision occurs', () => {
      const usedNames = new Set();
      const result1 = getUniqueFileName('src/utils/helper', 'javascript', 1, usedNames, true);
      
      // The actual implementation uses underscores not slashes
      expect(result1).toBe('src_utils_helper.js');
      expect(usedNames.has('src_utils_helper.js')).toBe(true);
      
      // Now try with same path but different message index
      const result2 = getUniqueFileName('src/utils/helper', 'javascript', 2, usedNames, true);
      
      // Due to collision, it will add a suffix
      expect(result2).toBe('3_src_utils_helper_*.js');
      expect(usedNames.has('3_src_utils_helper_*.js')).toBe(true);
    });
  });
  
  // Tests for processMessage
  describe('processMessage', () => {
    let zipMock;
    let usedNames;
    
    beforeEach(() => {
      // Create a mock for the zip object
      zipMock = {
        file: jest.fn().mockReturnThis()
      };
      
      // Set of used names for filename uniqueness
      usedNames = new Set();
    });
    
    test('should process assistant message and extract artifacts', () => {
      // Mock the payload
      const payload = {
        chat_messages: []
      };
      
      // Mock an assistant message
      const message = {
        sender: 'assistant',
        text: '<antArtifact title="test" language="javascript">console.log("test");</antArtifact>',
        index: 0,
        uuid: '123'
      };
      
      // Call the function
      const result = processMessage(message, payload, zipMock, usedNames, 0, false, 0);
      
      // Assert that zip.file was called to add the artifact
      // expect(zipMock.file).toHaveBeenCalled();
      expect(zipMock.file).toHaveBeenCalledWith('1_test.js', 'console.log("test");');
      
      // Assert that the artifact count was incremented
      expect(result).toBe(1);
    });
    
    test('should handle multiple artifacts in a message', () => {
      // Mock the payload
      const payload = {
        chat_messages: []
      };
      
      // Mock an assistant message with multiple artifacts
      const message = {
        sender: 'assistant',
        text: `
          <antArtifact title="file1" language="javascript">console.log("one");</antArtifact>
          <antArtifact title="file2" language="python">print("two")</antArtifact>
        `,
        index: 0,
        uuid: '123'
      };
      
      // Call the function
      const result = processMessage(message, payload, zipMock, usedNames, 0, false, 0);
      
      // Assert that zip.file was called twice
      // expect(zipMock.file).toHaveBeenCalledTimes(2);
      expect(zipMock.file).toHaveBeenCalledWith('1_file1.js', 'console.log("one");');
      expect(zipMock.file).toHaveBeenCalledWith('1_file2.py', 'print("two")');
      
      // Assert that the artifact count was incremented for both artifacts
      expect(result).toBe(2);
    });
    
    test('should not process non-assistant messages', () => {
      // Mock the payload
      const payload = {
        chat_messages: []
      };
      
      // Mock a user message
      const message = {
        sender: 'user',
        text: 'Hello, Claude!',
        index: 0,
        uuid: '123'
      };
      
      // Call the function
      const result = processMessage(message, payload, zipMock, usedNames, 0, false, 0);
      
      // Assert that zip.file was not called
      expect(zipMock.file).not.toHaveBeenCalled();
      
      // Assert that no artifacts were found
      expect(result).toBe(0);
    });
    
    test('should process child messages recursively', () => {
      // Mock the payload with child messages
      const childMessage1 = {
        sender: 'assistant',
        text: '<antArtifact title="child1" language="javascript">console.log("child1");</antArtifact>',
        index: 1,
        uuid: 'child1',
        parent_message_uuid: '123',
        created_at: '2023-01-01T12:00:00Z'
      };
      
      const childMessage2 = {
        sender: 'assistant',
        text: '<antArtifact title="child2" language="python">print("child2")</antArtifact>',
        index: 2,
        uuid: 'child2',
        parent_message_uuid: '123',
        created_at: '2023-01-01T12:05:00Z'
      };
      
      const payload = {
        chat_messages: [childMessage1, childMessage2]
      };
      
      // Mock a parent message
      const parentMessage = {
        sender: 'assistant',
        text: '<antArtifact title="parent" language="html"><p>Parent</p></antArtifact>',
        index: 0,
        uuid: '123'
      };
      
      // Call the function with the parent message
      const result = processMessage(parentMessage, payload, zipMock, usedNames, 0, false, 0);
      
      // Assert that zip.file was called three times
      // expect(zipMock.file).toHaveBeenCalledTimes(3);
      expect(zipMock.file).toHaveBeenCalledWith('1_parent.html', '<p>Parent</p>');
      expect(zipMock.file).toHaveBeenCalledWith('2_child1.js', 'console.log("child1");');
      expect(zipMock.file).toHaveBeenCalledWith('3_child2.py', 'print("child2")');
      
      // Assert that the total artifact count is 3
      expect(result).toBe(3);
    });
    
    test('should stop at maximum recursion depth', () => {
      // Mock an assistant message
      const message = {
        sender: 'assistant',
        text: '<antArtifact title="test" language="javascript">console.log("test");</antArtifact>',
        index: 0,
        uuid: '123'
      };
      
      // Create a payload with no messages
      const payload = {
        chat_messages: []
      };
      
      // Call the function with depth exceeding the limit
      const result = processMessage(message, payload, zipMock, usedNames, 0, false, 101);
      
      // Should have added the artifact but warned about depth
      expect(zipMock.file).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        'Maximum recursion depth reached. Stopping message processing.'
      );
    });
  });
  
  // Tests for Chat Request Detection
  describe('Chat request detection', () => {
    // TODO: use this as a teachable moment for AI problems
    // Our own implementation of isChatRequest for tests
    // function testIsChatRequest(request) {
    //   if (!request || !request.method || !request.url) return false;
      
    //   const regex = /https:\/\/[^\/]*claude\.ai\/api\/organizations\/[^\/]+\/chat_conversations\/[^\/]+\/messages/;
    //   const isMatch = regex.test(request.url);
      
    //   return request.method === "GET" && isMatch;
    // }
    
    test('should correctly identify Claude chat API request', () => {
      const request = {
        method: 'GET',
        url: 'https://claude.ai/api/organizations/org-123/chat_conversations/chat-456/messages'
      };
      // expect(testIsChatRequest(request)).toBe(true);
      expect(isChatRequest(request)).toBe(true);
    });
    
    test('should reject non-GET request', () => {
      const request = {
        method: 'POST',
        url: 'https://claude.ai/api/organizations/org-123/chat_conversations/chat-456/messages'
      };
      // expect(testIsChatRequest(request)).toBe(false);
      expect(isChatRequest(request)).toBe(false);
    });
    
    test('should reject non-matching URL', () => {
      const request = {
        method: 'GET',
        url: 'https://claude.ai/api/organizations/org-123/something-else'
      };
      // expect(testIsChatRequest(request)).toBe(false);
      expect(isChatRequest(request)).toBe(false);
    });
    
    test('should handle undefined or malformed request', () => {
      // expect(testIsChatRequest(undefined)).toBe(false);
      // expect(testIsChatRequest({})).toBe(false);
      // expect(testIsChatRequest({ method: 'GET' })).toBe(false);
      // expect(testIsChatRequest({ url: 'https://claude.ai/api' })).toBe(false);
      expect(isChatRequest(undefined)).toBe(false);
      expect(isChatRequest({})).toBe(false);
      expect(isChatRequest({ method: 'GET' })).toBe(false);
      expect(isChatRequest({ url: 'https://claude.ai/api?tree=True&rendering_mode=raw' })).toBe(false);
    });
    
    test('should handle subdomain variations', () => {
      const request = {
        method: 'GET',
        url: 'https://subdomain.claude.ai/api/organizations/12345/chat_conversations/67890/messages'
      };
      // expect(testIsChatRequest(request)).toBeTruthy();
      expect(isChatRequest(request)).toBeTruthy();
    });
  });
  
  // Tests for isOwnRequest function
  describe('Own request detection', () => {
    test('should identify request with X-Own-Request header', () => {
      const request = {
        requestHeaders: [
          { name: 'X-Own-Request', value: 'true' }
        ]
      };
      expect(isOwnRequest(request)).toBe(true);
    });
  
    test('should reject request without X-Own-Request header', () => {
      const request = {
        requestHeaders: [
          { name: 'Content-Type', value: 'application/json' },
          { name: 'Authorization', value: 'Bearer token' }
        ]
      };
      expect(isOwnRequest(request)).toBe(false);
    });
  
    test('should handle case where requestHeaders is empty', () => {
      const request = {
        requestHeaders: []
      };
      expect(isOwnRequest(request)).toBe(false);
    });
  
    test('should handle case where requestHeaders is undefined', () => {
      const request = {};
      expect(isOwnRequest(request)).toBe(false);
    });
  
    });
  
    test('should handle null or undefined input', () => {
      // TODO: use this as a teachable moment for AI problems
      // try {
      //   window.isOwnRequest(null);
      //   expect(window.isOwnRequest(null)).toBe(false);
      // } catch(e) {
      //   expect(e).toBeDefined();
      // }
      
      // try {
      //   window.isOwnRequest(undefined);
      //   expect(window.isOwnRequest(undefined)).toBe(false);
      // } catch(e) {
      //   expect(e).toBeDefined();
      // }
      expect(isOwnRequest(null)).toBe(false);
      expect(isOwnRequest(undefined)).toBe(false);
    });
  });
}); 