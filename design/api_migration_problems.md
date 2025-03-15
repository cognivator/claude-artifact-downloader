# Claude Artifact Downloader API Migration Problems

## 2. Messages API Migration

**Problem**: The extension uses regex-based extraction (`extractArtifacts` function in `background.js:142`) to find artifacts, but Claude 3.5+ uses a standardized JSON structure with typed content blocks.

**Affected Code**:
```background.js:142-160
function extractArtifacts(text) {
  const artifactRegex = /<antArtifact[^>]*>([\s\S]*?)<\/antArtifact>/g;
  const artifacts = [];
  let match;

  while ((match = artifactRegex.exec(text)) !== null) {
    const fullTag = match[0];
    const content = match[1];

    const titleMatch = fullTag.match(/title="([^"]*)/);
    const languageMatch = fullTag.match(/language="([^"]*)/);

    artifacts.push({
      title: titleMatch ? titleMatch[1] : "Untitled",
      language: languageMatch ? languageMatch[1] : "txt",
      content: content.trim(),
    });
  }
  return artifacts;
}
```

This needs to be updated to handle the new Messages API format which uses structured content blocks in a standardized JSON format:
```json
{
  "role": "assistant",
  "content": [
    {"type": "text", "text": "..."},
    {"type": "code", "language": "python", "text": "..."}
  ]
}
```

## 3. New Artifact Types Support

**Problem**: The extension only handles code artifacts, but Claude 3.5+ supports multiple content types in its structured responses:
- Code blocks with language specification
- Images (JPEG, PNG, GIF, WEBP)
- Tool outputs (including text editor results)
- Plain text documents
- SVG graphics
- Interactive React components

**Affected Code**:
- Artifact type definition in `background.js:142-160`
- File extension handling in `background.js:getFileExtension` (not shown in snippets)
- ZIP file creation logic in `background.js:6-86`

## 4. Structured Content Block Parsing

**Problem**: The current regex-based parsing assumes a simple text format, but Claude 3.5+ uses a structured JSON format for content blocks that requires proper parsing and type handling.

**Affected Code**:
```background.js:71-86
// Process assistant messages
if (message.sender === "assistant" && message.text) {
  try {
    const artifacts = extractArtifacts(message.text);
    artifacts.forEach((artifact, artifactIndex) => {
      artifactCount++;
      const fileName = getUniqueFileName(
        artifact.title,
        artifact.language,
        message.index,
        usedNames,
        useDirectoryStructure,
      );
      zip.file(fileName, artifact.content);
      console.log(`Added artifact: ${fileName}`);
    });
  } catch (error) {
    console.error(`Error processing message ${message.uuid}:`, error);
  }
}
```

This section needs to be updated to:
1. Parse the structured JSON format of messages
2. Handle multiple content block types appropriately
3. Extract metadata (like language) from the structured format
4. Support parallel tool use responses when enabled

## Migration Path

The migration will require:
1. Updating the message processing to use the Messages API format
2. Adding support for new artifact types with appropriate file handling
3. Implementing proper JSON parsing for structured content blocks
4. Maintaining backward compatibility for older chat history

References:
- [Claude 3.5 Sonnet announcement](https://www.anthropic.com/news/claude-3-5-sonnet)
- [Messages API documentation](https://docs.anthropic.com/en/api/messages-count-tokens) 