# Claude Artifact Downloader - Phase I Migration Plan

## Overview

Phase I of the extension updates focuses exclusively on adding support for the newer Claude API specifications while maintaining backward compatibility with previous API formats. This phase involves no UI changes and should transparently handle different Claude models and API versions.

## Objectives

- Add support for Claude 3.5+ structured JSON responses
- Maintain backward compatibility with older Claude API formats
- Implement transparent model/API detection without UI changes
- Provide fallback processing for ambiguous cases

## API Changes Summary

The extension currently uses regex-based extraction to find artifacts (`extractArtifacts` function in `background.js`), but Claude 3.5+ uses a standardized JSON structure with typed content blocks:

```json
{
  "role": "assistant",
  "content": [
    {"type": "text", "text": "..."},
    {"type": "code", "language": "python", "text": "..."}
  ]
}
```

## Architecture and Interface Specifications

### Type Definitions

```typescript
/**
 * Information about the detected Claude model and API version
 */
interface ModelInfo {
  /** API version: 'modern' (Claude 3.5+), 'claude-3', or 'legacy' */
  version: 'modern' | 'claude-3' | 'legacy';
  /** Specific model identifier if available */
  model: string;
  /** Whether to use structured content extraction */
  useStructuredContent: boolean;
}

/**
 * Represents an artifact extracted from Claude's response
 */
interface Artifact {
  /** Title of the artifact */
  title: string;
  /** Programming language or file type */
  language: string;
  /** The actual content of the artifact */
  content: string;
}

/**
 * Represents a content block in Claude 3.5+ structured responses
 */
interface ContentBlock {
  /** Content type: 'text', 'code', etc. */
  type: string;
  /** Programming language (for code blocks) */
  language?: string;
  /** The actual content */
  text: string;
}

/**
 * Modern Claude message format (Claude 3.5+)
 */
interface ModernClaudeMessage {
  /** Message role: 'assistant' or 'user' */
  role: string;
  /** Array of content blocks */
  content: ContentBlock[];
  /** Message identifier */
  uuid?: string;
}

/**
 * Legacy Claude message format
 */
interface LegacyClaudeMessage {
  /** Message sender: 'assistant' or 'user' */
  sender: string;
  /** Message text content */
  text: string;
  /** Message identifier */
  uuid?: string;
  /** Message index in the conversation */
  index?: number;
  /** Model information if available */
  model?: string;
}

/**
 * Union type representing any Claude message format
 */
type ClaudeMessage = ModernClaudeMessage | LegacyClaudeMessage;
```

### Function Signatures

```typescript
/**
 * Detects the Claude model and API version in use
 * @param message - The message data from Claude
 * @returns Details about detected model and API version
 */
function detectModelAndAPI(message: ClaudeMessage): ModelInfo;

/**
 * Extract artifacts from Claude messages in both legacy and modern formats
 * @param message - The message data from Claude
 * @returns Array of extracted artifacts
 */
function extractAllArtifacts(message: ClaudeMessage): Artifact[];

/**
 * Extract artifacts from structured content format (Claude 3.5+)
 * @param message - The structured message data
 * @returns Array of extracted artifacts
 */
function extractStructuredArtifacts(message: ModernClaudeMessage): Artifact[];

/**
 * Extract artifacts from legacy format using regex
 * @param text - The text content to extract artifacts from
 * @returns Array of extracted artifacts
 */
function extractLegacyArtifacts(text: string): Artifact[];

/**
 * Attempts to extract artifacts using multiple methods when primary detection fails
 * @param message - The message data from Claude
 * @returns Array of extracted artifacts
 */
function fallbackArtifactExtraction(message: ClaudeMessage | string): Artifact[];

/**
 * Basic text analysis for artifact extraction when other methods fail
 * @param message - The message to analyze
 * @returns Array of extracted artifacts
 */
function extractBasicArtifacts(message: ClaudeMessage | string): Artifact[];
```

## Theory of Operation

### Extension Processing Flow

The extension's architecture involves a multi-stage processing pipeline for Claude responses:

1. **Interception**: Chrome extension background worker intercepts Claude API responses
2. **Classification**: The message is classified using `detectModelAndAPI` to determine format
3. **Extraction**: Appropriate extraction method is chosen based on classification
4. **Fallback**: If extraction fails, fallback mechanisms attempt alternative processing
5. **Packaging**: Successful extractions are organized and packaged into a ZIP file

### Model & API Detection

The `detectModelAndAPI` function provides the critical entry point for format determination. It analyzes incoming Claude messages to determine:

- Which API version produced the message (modern/Claude 3.5+ vs legacy)
- What extraction strategy to use (structured vs regex)
- What model characteristics to account for

The detection uses multiple vectors to maximize accuracy:

1. **Structure Analysis**: Examines message structure (presence of content array vs text field)
2. **Model Metadata**: Checks for explicit model identification in response
3. **Format Markers**: Identifies format-specific indicators in the message

Detection works transparently without user input, allowing seamless operation across different Claude versions.

### Artifact Extraction Strategy

The extraction strategy follows a pragmatic approach:

1. Use `extractAllArtifacts` as the main entry point for artifact extraction
2. Delegate to appropriate extraction method based on model detection
3. If extraction fails, apply fallback processing

This architecture ensures maximum compatibility across Claude API versions while preparing for future expansion to additional content types in Phase II.

### Structured Content Handling

For Claude 3.5+ responses, the system leverages the standardized JSON structure:

1. Identifies content blocks of type "code"
2. Extracts language information directly from the structure
3. Maintains the same artifact format as legacy extraction for compatibility

The structured format provides more reliable extraction with fewer false positives compared to regex-based extraction.

### Interaction with Existing Codebase

The new components integrate with the existing codebase at specific integration points:

1. **Background Message Processing**: Intercepts and processes assistant messages
2. **Artifact Collection**: Feeds extracted artifacts into existing ZIP creation logic
3. **Filename Generation**: Uses existing filename generation logic for consistency

This approach minimizes changes to the core functionality while adding new capabilities.

## Testing Plan

1. **Compatibility Testing**: Test with both old and new Claude API formats
2. **Edge Case Testing**: Verify handling of malformed or unexpected responses
3. **Model Variation Testing**: Test with all supported Claude models
4. **Fallback Testing**: Verify fallback mechanism works correctly

## Timeline

1. **Implementation**: 2 weeks
   - API detection mechanism (3 days)
   - Structured content extraction (4 days)
   - Fallback processing (3 days)
   - Integration with existing flow (4 days)

2. **Testing**: 1 week
   - Unit testing (2 days)
   - Integration testing (3 days)
   - Final bug fixes (2 days)

## Future Considerations for Phase II

While not part of Phase I, these items should be considered for future phases:

1. UI enhancements for artifact preview
2. Support for additional content types (images, SVG, etc.)
3. Improved error handling and user feedback
4. Directory structure optimization for different artifact types 