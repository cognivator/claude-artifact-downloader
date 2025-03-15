# Claude Artifact Downloader API Migration Plan

## Overview

This document outlines the plan to update the Claude Artifact Downloader extension to support both current and legacy Claude APIs, with automatic model detection and graceful fallbacks.

## Goals

1. Support all Claude API specifications (legacy and current)
2. Automatically detect and use appropriate API based on model
3. Maintain backward compatibility
4. No required UI changes for end users
5. Prepare for future enhancements

## Architecture

### 1. API Integration Layer

```typescript
// artifacts/api/types.ts
interface BaseClaudeAPI {
  extractArtifacts(message: string): Promise<Artifact[]>;
  formatMessage(content: string): any;
}

class Claude3API implements BaseClaudeAPI {
  // Handles structured content blocks:
  // - Code blocks
  // - Image artifacts
  // - Tool outputs
  // - System messages
}

class LegacyClaudeAPI implements BaseClaudeAPI {
  // Handles legacy format:
  // - Regex-based code block extraction
  // - Human/Assistant turn parsing
  // - Basic sanitization
}
```

### 2. Model Detection System

```typescript
// artifacts/model-detection.ts
class ModelDetector {
  static async detectModel(): Promise<string> {
    // Detection strategy:
    // 1. UI element inspection
    // 2. API format testing
    // 3. Fallback to latest supported
  }

  static getAPIHandler(model: string): BaseClaudeAPI {
    // Maps models to appropriate API implementations
  }
}
```

### 3. Artifact Processing

```typescript
// artifacts/processor.ts
interface Artifact {
  type: 'code' | 'image' | 'tool_output';
  content: string | Blob;
  metadata: {
    language?: string;
    timestamp: number;
    messageIndex: number;
  };
}

class ArtifactProcessor {
  static async process(message: any): Promise<Artifact[]>;
}
```

### 4. Fallback Strategy

```typescript
// artifacts/fallback.ts
class APIFallbackHandler {
  static async tryExtraction(message: string): Promise<Artifact[]>;
}
```

## Implementation Phases

1. **Phase 1: Core Infrastructure**
   - Create API abstraction layer
   - Implement Claude 3 API support
   - Add basic model detection

2. **Phase 2: Legacy Support**
   - Implement legacy API support
   - Add fallback mechanisms
   - Update extraction logic

3. **Phase 3: UI Updates**
   - Add hidden model selector
   - Update artifact display
   - Add preview functionality

4. **Phase 4: Testing & Validation**
   - Unit tests per API version
   - Integration tests
   - E2E testing
   - UI testing

## File Structure

```
src/
├── artifacts/
│   ├── api/
│   │   ├── types.ts
│   │   ├── claude3.ts
│   │   └── legacy.ts
│   ├── model-detection.ts
│   ├── processor.ts
│   └── fallback.ts
├── background.js
└── content.js
```

## Testing Strategy

1. **Unit Tests**
   - API implementations
   - Model detection
   - Artifact processing
   - Fallback handling

2. **Integration Tests**
   - Cross-API compatibility
   - Model detection accuracy
   - Artifact extraction reliability

3. **E2E Tests**
   - Complete download workflow
   - UI interaction
   - Error handling

## Future Enhancements

1. **UI Improvements**
   - Optional model selection
   - Artifact preview
   - Selection interface
   - Custom naming schemes

2. **API Features**
   - Support for new content types
   - Enhanced metadata extraction
   - Custom artifact processors

## Compatibility Matrix

| Model Version | API Support | Artifact Types |
|--------------|-------------|----------------|
| Claude 3.x   | Messages API| Code, Images, Tools |
| Claude 2.x   | Messages API| Code |
| Legacy       | Text API    | Code |

## Notes

- All API changes must maintain backward compatibility
- Model detection should be non-intrusive
- Fallback strategy should be transparent to users
- Error handling must be robust and informative 