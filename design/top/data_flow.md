# Claude Artifact Downloader Data Flow

## Extension Lifecycle

1. **Installation and Initialization**
   - Extension is installed in Chrome [manifest.json (1-19)]
   - Manifest defines permissions and configuration [manifest.json (5-7)]
   - Background service worker is registered [manifest.json (8-10), background.js (1-2)]
   - Content scripts are injected into Claude web interface [manifest.json (11-16)]
   - JSZip library is imported for ZIP file creation [background.js (2)]
   - Banner styles are added to the page [banner.js (27-48)]
   - Background script listens for messages from UI [background.js (4-95)]
   - Background script listens for Claude API requests [background.js (269-281)]

2. **Page Load and UI Setup**
   - Content script runs when Claude chat page loads [content.js (95)]
   - Content script listens for messages from service worker [content.js (98-110)]
   - Extension checks for UI elements and adds download button [content.js (74-90)]
   - Download button and options dropdown are created [content.js (1-61)]
   - Background script listens for tab URL changes [background.js (264-268)]
   - When URL changes to a chat page, content script is notified [background.js (265-267)]

3. **Chat Data Monitoring and Storage**
   - Background script intercepts Claude API requests [background.js (270-281)]
   - Checks if request is for chat data [background.js (283-287)]
   - Fetches chat data from Claude API [background.js (296-312)]
   - Stores chat data in Chrome local storage [background.js (273-275)]
   - Associates data with chat UUID for later retrieval [background.js (273-275)]

4. **User Interaction**
   - User clicks "Download Artifacts" button [content.js (62-72)]
   - Content script extracts chat UUID from URL [content.js (63-64)]
   - Gets directory structure preference from dropdown [content.js (65-66)]
   - Sends download request to background script [content.js (67-71)]

5. **Artifact Processing**
   - Background script receives download request [background.js (3-4)]
   - Retrieves chat data from storage using UUID [background.js (5-14)]
   - Creates new ZIP archive [background.js (18)]
   - Finds most recent root message [background.js (21-34)]
   - Processes message tree recursively [background.js (37-49, 97-156)]
   - For each assistant message, extracts artifacts [background.js (107-156)]
   - Parses message text using regex to find artifact tags [background.js (158-178)]
   - Extracts artifact title, language, and content [background.js (110-124)]
   - Generates unique filenames for artifacts [background.js (180-207)]
   - Determines appropriate file extensions [background.js (228-251)]
   - Organizes artifacts according to directory structure preference [background.js (209-226)]
   - Adds artifacts to ZIP archive [background.js (119)]

6. **Download Generation and Completion**
   - Generates ZIP file from collected artifacts [background.js (61-95)]
   - Converts ZIP to base64 data URL [background.js (253-262)]
   - Triggers browser download with appropriate filename [background.js (62-72)]
   - Sends success/failure notification to content script [background.js (73-86)]
   - Content script displays notification banner [content.js (100-104), banner.js (8-15, 52-58, 74-85)]

## Implementation Notes

Key areas requiring significant changes:
1. Enhanced metadata and storage management for new content types
2. UI for artifact preview and selection
3. Multi-file artifact handling
4. Progress tracking and notifications
5. Artifact validation and cleanup
