# Claude Artifact Downloader - Sequence Diagram
> current

```mermaid
sequenceDiagram
    participant User
    participant Chrome
    participant ContentScript
    participant BackgroundWorker
    participant ChromeStorage
    participant ClaudeAPI
    
    %% Installation and Initialization
    User->>Chrome: Install extension
    Chrome->>BackgroundWorker: Register service worker
    Chrome->>ContentScript: Inject into claude.ai pages
    BackgroundWorker->>Chrome: Listen for tab URL changes
    BackgroundWorker->>Chrome: Listen for API requests
    
    %% Page Load and UI Setup
    User->>Chrome: Navigate to claude.ai/chat
    Chrome->>BackgroundWorker: Load page
    BackgroundWorker->>ContentScript: claude tab loaded (message)
    ContentScript->>ContentScript: Add download button & dropdown
    
    %% Chat Data Monitoring
    User->>ClaudeAPI: Interact with Claude
    ClaudeAPI-->>Chrome: Send chat data response
    BackgroundWorker->>BackgroundWorker: Intercept API request
    BackgroundWorker->>ClaudeAPI: Fetch chat data
    ClaudeAPI-->>BackgroundWorker: Return chat data
    BackgroundWorker->>ChromeStorage: Store chat data with UUID
    
    %% User Interaction
    User->>ContentScript: Click "Download Artifacts"
    ContentScript->>ContentScript: Get chat UUID from URL
    ContentScript->>ContentScript: Get directory structure preference
    ContentScript->>BackgroundWorker: Send download request
    
    %% Artifact Processing
    BackgroundWorker->>ChromeStorage: Retrieve chat data by UUID
    ChromeStorage-->>BackgroundWorker: Return chat data
    BackgroundWorker->>BackgroundWorker: Create ZIP archive
    BackgroundWorker->>BackgroundWorker: Find root message
    BackgroundWorker->>BackgroundWorker: Process message tree recursively
    loop For each assistant message
        BackgroundWorker->>BackgroundWorker: Extract artifacts using regex
        BackgroundWorker->>BackgroundWorker: Generate unique filenames
        BackgroundWorker->>BackgroundWorker: Add to ZIP archive
    end
    
    %% Download Generation and Completion
    BackgroundWorker->>BackgroundWorker: Generate final ZIP file
    BackgroundWorker->>BackgroundWorker: Convert to base64 data URL
    BackgroundWorker->>Chrome: Trigger download
    Chrome-->>User: Save ZIP file
    BackgroundWorker->>ContentScript: Send completion notification
    ContentScript->>User: Display success/error banner
```

## Diagram Explanation

This sequence diagram illustrates the complete lifecycle of the Claude Artifact Downloader extension, from installation through to artifact download. Key phases include:

1. **Installation and Initialization**: Extension setup in Chrome
2. **Page Load and UI Setup**: Content script adds UI elements to Claude interface; Background worker listens for tab load and claude chat requests
3. **Chat Data Monitoring**: Background worker intercepts and stores Claude API responses
4. **User Interaction**: User triggers download through UI
5. **Artifact Processing**: Background worker processes chat data to extract artifacts
6. **Download Generation**: ZIP file is created and downloaded

The diagram shows interactions between:
- User
- Chrome browser
- Content script (running in Claude web page)
- Background service worker
- Chrome storage API
- Claude API

This represents the current implementation without the planned enhancements for new content types and improved UI. 