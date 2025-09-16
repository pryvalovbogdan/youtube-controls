# YouTube Controls Socket Extension

This Chrome extension allows controlling YouTube video playback via a WebSocket server.  
It supports commands such as stopping currently playing videos and retrieving the title of the active video.

---

## 🚀 Features
- Connects to a WebSocket server (`ws://localhost:3000` by default).
- Listens for commands from the server:
    - **STOP_AUDIO** → pauses all playing YouTube videos.
    - **GET_SONG** → retrieves the title of the currently playing YouTube video and sends it back to the server.
- Works seamlessly across all open YouTube tabs.
- Simple architecture with clear separation of:
    - **Background script** → manages WebSocket and communication with content scripts.
    - **Content script** → interacts directly with YouTube's DOM (video/audio elements).

---

## 🛠 Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/pryvalovbogdan/youtube-controls.git
   cd youtube-controls-extension
   ```

2. Open Chrome and navigate to:
   ```
   chrome://extensions/
   ```

3. Enable **Developer mode** (top-right corner).

4. Click **Load unpacked** and select the project folder.

5. The extension should now appear in your extensions bar.

---

## ⚙️ How It Works

### Background Script (`background.js`)
- Establishes a WebSocket connection to the server.
- Listens for incoming WebSocket messages and forwards them to YouTube tabs.
- Handles responses from content scripts (e.g., sending back the current song name).

### Content Script (`contentScript.js`)
- Listens for messages from the background script.
- Stops all currently playing videos when receiving `STOP_PLAYING`.
- Retrieves the current video title when receiving `GET_SONG` and responds back.

---

## 📡 WebSocket API

The WebSocket server communicates with the extension using JSON messages.

### Commands

#### Stop currently playing video(s)
```json
{
  "type": "STOP_AUDIO",
  "payload": "optional reason/message"
}
```

#### Get the current song/video title
```json
{
  "type": "GET_SONG",
  "payload": "optional request id"
}
```

### Responses
```json
{
  "type": "SONG_NAME_RECEIVED",
  "payload": "Rick Astley - Never Gonna Give You Up (Official Music Video)"
}
```

---

## 📂 Project Structure
```
youtube-controls-extension/
├── background.js        # Manages WebSocket and communication with tabs
├── contentScript.js     # Handles video playback control and song info
├── manifest.json        # Chrome extension configuration
├── popup.html           # Example popup UI (optional)
└── README.md            # Project documentation
```

---

## 📝 Manifest Configuration

The extension is defined in `manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "YouTube Controls Socket Extension",
  "version": "1.0",
  "permissions": ["scripting", "storage", "tabs", "webNavigation"],
  "host_permissions": ["ws://localhost:3000/", "*://*.youtube.com/*"],
  "content_scripts": [
    {
      "matches": ["*://*.youtube.com/*"],
      "js": ["contentScript.js"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html"
  }
}
```

---

## 🔧 Customization
- Change the WebSocket server URL by updating:
  ```js
  const WS_URL = 'ws://localhost:3000';
  ```
  inside `background.js`.

---

## 🛡 Permissions
The extension requires the following permissions:
- `tabs` → to find and interact with YouTube tabs.
- `scripting` → to inject and run content scripts.
- `storage` → optional storage for settings.
- `webNavigation` → monitor navigation events.
- `host_permissions` → allow WebSocket connection + YouTube access.

---

## 📜 License
MIT License — feel free to use, modify, and distribute.

---

## 🙌 Contribution
Contributions are welcome! Please open an issue or submit a PR if you want to improve this extension.

