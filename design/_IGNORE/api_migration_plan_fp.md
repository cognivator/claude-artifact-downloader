# Claude Artifact Downloader API Migration Plan (FP Design)

## Overview

This document outlines the functional programming approach to updating the Claude Artifact Downloader extension, emphasizing immutable data structures, pure functions, and composition.

## Goals

Same as original plan, with additional FP-specific goals:
1. Pure functions for predictable behavior
2. Immutable data structures
3. Composition over inheritance
4. Side effects isolation

## Architecture

### 1. API Integration Layer

```typescript
// Types
type Artifact = Readonly<{
  type: 'code' | 'image' | 'tool_output';
  content: string | Blob;
  metadata: Readonly<{
    language?: string;
    timestamp: number;
    messageIndex: number;
  }>;
}>;

type Message = Readonly<{
  uuid: string;
  parent_message_uuid: string;
  sender: 'assistant' | 'human';
  text: string;
  content?: Array<{type: string; [key: string]: any}>;
  created_at: string;
  updated_at: string;
  index: number;
}>;

type ExtractorFn = (message: Message) => Promise<Artifact[]>;

type APIResult = Readonly<{
  artifacts: Artifact[];
  errors: string[];
}>;

// Core Functions
// Low-level message text parsing
function extractArtifacts(messageText: string, apiVersion: string): Promise<APIResult>;

// Message formatting for different API versions - used by extractArtifactsFromMessage
function formatMessage(content: string, apiVersion: string): Message;

// Get model-specific extractor - used by extractArtifactsFromMessage
function getExtractor(model: ModelInfo): ExtractorFn;

// High-level orchestration that uses formatMessage and getExtractor
function extractArtifactsFromMessage(
  message: Message, 
  config: ExtractorOrchestrationConfig
): Promise<Artifact[]>;

// Example composition flow:
// 1. Raw text -> extractArtifacts -> APIResult (legacy/direct path)
// 2. Raw text -> formatMessage -> Message -> extractArtifactsFromMessage -> Artifact[] (modern path)
//    where extractArtifactsFromMessage uses getExtractor internally

// Orchestration
type ExtractorOrchestrationConfig = Readonly<{
  model: ModelInfo;
  fallbackEnabled: boolean;
}>;
```

### 2. Model Detection

```typescript
type ModelInfo = Readonly<{
  version: string;
  capabilities: Set<string>;
}>;

function detectModel(): Promise<ModelInfo>;
```

### 3. Artifact Processing

```typescript
type ProcessorConfig = Readonly<{
  includeTypes: Set<string>;
  maxSize?: number;
}>;

function processArtifacts(artifacts: Artifact[], config: ProcessorConfig): Artifact[];
function enrichMetadata(artifact: Artifact): Artifact;
```

### 4. Fallback Strategy

```typescript
function tryExtraction(message: Message, extractors: ExtractorFn[]): Promise<Artifact[]>;
```

## Implementation Phases

1. **Phase 1: Core Functions**
   - Implement pure API functions
   - Create immutable data types
   - Set up function composition utilities

2. **Phase 2: Legacy Support**
   - Implement legacy extractors
   - Create fallback composition
   - Add result transformers

3. **Phase 3: UI Integration**
   - Create UI state management
   - Add pure render functions
   - Implement event handlers

4. **Phase 4: Testing**
   - Unit tests for pure functions
   - Property-based testing
   - Integration testing

## File Structure

```
src/
├── artifacts/
│   ├── api/
│   │   ├── types.ts
│   │   ├── extractors.ts
│   │   └── transformers.ts
│   ├── detection/
│   │   ├── model.ts
│   │   └── capabilities.ts
│   ├── processing/
│   │   ├── core.ts
│   │   └── enrichment.ts
│   └── utils/
│       ├── composition.ts
│       └── validation.ts
├── background.ts
└── content.ts
```

## Testing Strategy

1. **Pure Function Tests**
   - Input/output validation
   - Property-based testing
   - Composition testing

2. **Integration Tests**
   - Function composition flows
   - Side effect isolation
   - Error propagation

3. **E2E Tests**
   - Full extraction pipeline
   - UI interaction
   - Error handling

## Utilities

```typescript
// utils/composition.ts
const pipe = <T>(...fns: Array<(arg: T) => T>) => 
  (value: T): T => fns.reduce((acc, fn) => fn(acc), value);

const asyncPipe = <T>(...fns: Array<(arg: T) => Promise<T>>) =>
  async (value: T): Promise<T> => {
    let result = value;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
```

## Error Handling

```typescript
// utils/error.ts
type Result<T, E = string> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

const tryCatch = async <T>(
  fn: () => Promise<T>
): Promise<Result<T>> => {
  try {
    return { ok: true, value: await fn() };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
};
```

## Compatibility Matrix

| Model Version | API Version | Artifact Types | Message Format |
|--------------|-------------|----------------|----------------|
| Claude 3.x | Messages API | code, image, tool_output | Structured content blocks |
| Claude 2.x | Messages API | code | text with code blocks |
| Legacy | Text Completions | code | \n\nHuman: / \n\nAssistant: |

### API Support Details

- **Claude 3.x**
  - Full support for structured content blocks
  - Native image handling
  - Tool output support
  - Messages API required

- **Claude 2.x**
  - Messages API support
  - Text-based code block extraction
  - No image or tool support
  - Both APIs supported

- **Legacy Models**
  - Text Completions API only
  - Basic code block extraction
  - Limited to text-based interactions

## Notes

- Functions should be pure and predictable
- Data structures should be immutable
- Side effects should be isolated and explicit
- Error handling should be functional (Either/Result types)
- Function composition should be preferred over inheritance