# Test FIXME Proposals

This document outlines proposed changes to address FIXME comments in the test files, specifically in `background.test.js`.

## "Isolate suffix from messageIndex" Fixes

1. **Line 299**: In test "should handle flat file with suffix"
   - Current: `const result = window.inferDirectoryStructure('test', '.js', 5, '_modified');`
   - Proposed: `const result = window.inferDirectoryStructure('test', '.js', undefined, '_modified');`
   - This change correctly isolates the suffix parameter from the messageIndex by passing undefined for messageIndex.

2. **Line 322**: In test "should handle directory structure with suffix"
   - Current: `const result = window.inferDirectoryStructure('src/utils/helper', '.js');`
   - Proposed: `const result = window.inferDirectoryStructure('src/utils/helper', '.js', undefined, '_modified');`
   - Add a proper suffix parameter while keeping the messageIndex as undefined.

3. **Line 353**: In test "should handle empty base name with suffix"
   - Current: `const result = window.inferDirectoryStructure('', '.txt', 1);`
   - Proposed: `const result = window.inferDirectoryStructure('', '.txt', undefined, '_modified');`
   - Pass undefined for messageIndex and add a suffix parameter.
   - Update the expected result accordingly: `expect(result).toBe('_modified.txt');`

4. **Line 378**: In test "should handle empty extension with suffix"
   - Current: `const result = window.inferDirectoryStructure('', '.txt', 1);`
   - Proposed: `const result = window.inferDirectoryStructure('sample', '', undefined, '_modified');`
   - Use empty string for extension, undefined for messageIndex, add suffix parameter.
   - Update the expected result accordingly: `expect(result).toBe('sample_modified');`

## "Match test description" Fixes

1. **Line 304**: Test "should handle flat file with messageIndex and suffix"
   - Current: `const result = window.inferDirectoryStructure('app/components/ui/button', '.tsx');`
   - Proposed: `const result = window.inferDirectoryStructure('test', '.js', 3, '_modified');`
   - Update expected result: `expect(result).toBe('4_test_modified.js');`

2. **Line 320**: Test "should handle directory structure with suffix"
   - Already addressed in the "isolate suffix" section above

3. **Line 327**: Test "should handle directory structure with messageIndex and suffix"
   - Current: `const result = window.inferDirectoryStructure('utils/helper', '.js', 2);`
   - Proposed: `const result = window.inferDirectoryStructure('utils/helper', '.js', 2, '_modified');`
   - Update expected result: `expect(result).toBe('utils/3_helper_modified.js');`

4. **Line 333**: Test "should handle message index of 0 correctly"
   - Current code matches description, just need to ensure the expected behavior is correct
   - No changes needed to test implementation

5. **Line 339**: Test "should handle empty base name"
   - Current implementation is correct for the description
   - No changes needed

6. **Line 345**: Test "should handle empty base name with message index"
   - Current implementation is correct for the description
   - No changes needed

7. **Line 351**: Test "should handle empty base name with suffix"
   - Already addressed in the "isolate suffix" section above

8. **Line 358**: Test "should handle empty base name with mesage index and suffix"
   - Current: `const result = window.inferDirectoryStructure('', '.txt', 1);`
   - Proposed: `const result = window.inferDirectoryStructure('', '.txt', 1, '_modified');`
   - Update expected result: `expect(result).toBe('2__modified.txt');`
   - Note: There's a typo in "mesage" in the test description, which can be changed to "message"

9. **Line 364**: Test "should handle empty extension"
   - Current: `const result = window.inferDirectoryStructure('', '.txt');`
   - Proposed: `const result = window.inferDirectoryStructure('test', '');`
   - Update expected result: `expect(result).toBe('test');`

10. **Line 370**: Test "should handle empty extension with message index"
    - Current: `const result = window.inferDirectoryStructure('', '.txt', 1);`
    - Proposed: `const result = window.inferDirectoryStructure('test', '', 1);`
    - Update expected result: `expect(result).toBe('2_test');`

11. **Line 376**: Test "should handle empty extension with suffix"
    - Current: `const result = window.inferDirectoryStructure('', '.txt', 1);`
    - Proposed: `const result = window.inferDirectoryStructure('test', '', undefined, '_modified');`
    - Update expected result: `expect(result).toBe('test_modified');`

12. **Line 383**: Test "should handle empty extension with messageIndex and suffix"
    - Current: `const result = window.inferDirectoryStructure('', '.txt', 1);`
    - Proposed: `const result = window.inferDirectoryStructure('test', '', 1, '_modified');`
    - Update expected result: `expect(result).toBe('2_test_modified');` 