# Directory Structure Handling Fix

## Problem Statement

The current implementation of the artifact downloader has a bug identified by the FIXME comment:
```
// FIXME: This is not generating directory structures correctly
```

The root cause is that the code sanitizes filenames (including path separators) before attempting to infer directory structure, effectively removing all path information.

## Proposed Solution

This document outlines a refactored approach to handling directory structures in artifact filenames while maintaining proper sanitization.

### Key Improvements

1. Preserve path separators during sanitization
2. Separate responsibilities between functions
3. Unified handling of path components
4. More maintainable duplicate filename resolution

## Implementation

```javascript
/**
 * Get a unique filename for an artifact, optionally preserving directory structure
 * 
 * @param {string} title - The original title or path of the artifact
 * @param {string} language - The language/type of the artifact
 * @param {number} messageIndex - The index of the message containing the artifact
 * @param {Set<string>} usedNames - Set of already used filenames to avoid duplicates
 * @param {boolean} useDirectoryStructure - Whether to maintain directory structure in the filename
 * @returns {string} A unique sanitized filename
 */
function getUniqueFileName(title, language, messageIndex, usedNames, useDirectoryStructure) {
  // Parse and sanitize the path components in one step
  const { sanitizedPath, sanitizedFilename } = sanitizePathComponents(title);
  const extension = getFileExtension(language);
  
  // Construct the base filename according to the directory structure option
  let fileName = constructFilePath(
    sanitizedPath,
    sanitizedFilename,
    extension,
    messageIndex,
    useDirectoryStructure
  );
  
  // Ensure uniqueness by adding counters if needed
  if (usedNames.has(fileName)) {
    fileName = makeUnique(fileName, usedNames);
  }
  
  usedNames.add(fileName);
  return fileName;
}

/**
 * Split a title into path and filename components and sanitize them
 * 
 * @param {string} title - The original title or path
 * @returns {Object} Object containing sanitized path and filename
 */
function sanitizePathComponents(title) {
  // Handle both Unix and Windows path separators
  const parts = title.split(/[\/\\]/);
  const filename = parts.pop() || "untitled";
  
  // Sanitize each part while preserving structure
  const sanitizedPathParts = parts.map(part => sanitizeComponent(part));
  const sanitizedPath = sanitizedPathParts.join('/');
  const sanitizedFilename = sanitizeComponent(filename);
  
  return { sanitizedPath, sanitizedFilename };
}

/**
 * Sanitize a single component (either path part or filename)
 * 
 * @param {string} component - The path component to sanitize
 * @returns {string} Sanitized component
 */
function sanitizeComponent(component) {
  return component.replace(/[^\w\-._]+/g, "_");
}

/**
 * Construct a file path based on the directory structure preference
 * 
 * @param {string} path - The sanitized path
 * @param {string} filename - The sanitized filename
 * @param {string} extension - The file extension
 * @param {number} messageIndex - The message index
 * @param {boolean} useDirectoryStructure - Whether to use directory structure
 * @returns {string} The constructed file path
 */
function constructFilePath(path, filename, extension, messageIndex, useDirectoryStructure) {
  if (useDirectoryStructure) {
    return path ? `${path}/${filename}${extension}` : `${filename}${extension}`;
  } else {
    return `${messageIndex + 1}_${filename}${extension}`;
  }
}

/**
 * Make a filename unique by adding incremental counters
 * 
 * @param {string} fileName - The original filename
 * @param {Set<string>} usedNames - Set of already used filenames
 * @returns {string} A unique filename
 */
function makeUnique(fileName, usedNames) {
  // Split at the last occurrence of / to separate path from filename
  const lastSlashIndex = fileName.lastIndexOf('/');
  const basePath = lastSlashIndex !== -1 ? fileName.substring(0, lastSlashIndex + 1) : '';
  const baseFilename = lastSlashIndex !== -1 ? fileName.substring(lastSlashIndex + 1) : fileName;
  
  // Split filename from extension
  const lastDotIndex = baseFilename.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? baseFilename.substring(0, lastDotIndex) : baseFilename;
  const ext = lastDotIndex !== -1 ? baseFilename.substring(lastDotIndex) : '';
  
  // Add counter until we find a unique name
  let counter = 1;
  let uniqueName;
  
  do {
    uniqueName = `${basePath}${name}_${counter}${ext}`;
    counter++;
  } while (usedNames.has(uniqueName));
  
  return uniqueName;
}
```
## Implementation Notes

1. **Cross-Platform Path Handling**: The solution handles both Unix-style (`/`) and Windows-style (`\`) path separators by normalizing them to forward slashes internally.

2. **Single Responsibility Principle**: Each function has a clear, specific responsibility:
   - `sanitizePathComponents`: Handles parsing and sanitizing paths
   - `sanitizeComponent`: Sanitizes individual path components
   - `constructFilePath`: Builds the final path based on user preferences
   - `makeUnique`: Handles collision resolution for duplicate filenames

3. **Removal of `inferDirectoryStructure`**: The previous approach used a separate function for directory inference, which is now integrated into the main workflow.

4. **Improved Uniqueness Handling**: The approach to making filenames unique now correctly preserves directory structures.

## Benefits

1. **Maintainability**: The code is more structured with clear separation of concerns
2. **Correctness**: Properly preserves directory structure information
3. **Flexibility**: Supports both flat and structured organization of artifacts
4. **Cross-Platform**: Works with both Unix and Windows path conventions 

## Alternative Implementation

Here's an alternative implementation of the `makeUnique` function that uses array split/join operations instead of substring manipulation:

```javascript
/**
 * FP utils
 **/
const compose = (...fns) => arg => fns.reduce((y, fn) => fn(y), arg);
const pipe = (...fns) => arg => fns.reduceRight((y, fn) => fn(y), arg);
const append = separator => suffix => base => [base, suffix].join(separator);
const prepend = separator => base => suffix => [base, suffix].join(separator);

/**
 * Alternative version of makeUnique using array split/join operations
 * 
 * @param {string} fileName - The original filename
 * @param {Set<string>} usedNames - Set of already used filenames
 * @returns {string} A unique filename
 */
function makeUniqueWithArrays(fileName, usedNames) {
  // Split path and filename using array operations
  const pathParts = fileName.split('/');
  const filenamePart = pathParts.pop() || '';
  const basePath = pathParts.join('/');
  
  // Split filename and extension
  const filenameParts = filenamePart.split('.');
  const ext = filenameParts.length > 1 ? filenameParts.pop() : '';
  const baseFilename = filenameParts.join('.');

  // Configure ext appender and path prepender
  const appendExt = append('.')(ext);
  const prependPath = append('/')(basePath);

  // Add unique suffix until we find a unique name
  let uniqueSuffix = '*';
  let uniqueName;
  do {
    // Configure suffix appender and uniqueName maker
    const appendSuffix = append('_')(uniqueSuffix);
    const makeUniqueName = pipe(
      appendSuffix,
      appendExt,
      prependPath
    );

    uniqueName = makeUniqueName(baseFilename);
    uniqueSuffix += '*';
  } while (usedNames.has(uniqueName));
  
  return uniqueName;
}
```

This alternative approach has the same functionality but uses array operations instead of string manipulation. While benchmark results can vary between browsers and JavaScript engines, array operations can sometimes be more readable and maintainable, especially when dealing with path parsing operations.

Note that for very large strings, the performance characteristics might differ between substring operations and split/join operations. According to some benchmarks, regular expressions and substring operations might be faster for short strings, while split/join can potentially perform better with very long strings or more complex operations.[¹](https://stackoverflow.com/questions/50463850/split-and-join-function-or-the-replace-function) 