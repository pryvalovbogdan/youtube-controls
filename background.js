let socket = null;
const WS_URL = 'ws://localhost:3000';
const YOUTUBE_HOST = 'youtube.com';

const queryTabsAsync = (query = {}) =>
    new Promise((resolve) => chrome.tabs.query(query, (tabs) => resolve(tabs || [])));

const sendMessageToTab = (tabId, message) =>
    new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            // If runtime.lastError exists, resolve with an object containing the error
            if (chrome.runtime.lastError) {
                resolve({ error: chrome.runtime.lastError.message });
            } else {
                resolve({ response });
            }
        });
    });

const findYouTubeTabs = async () => {
    const tabs = await queryTabsAsync({});
    return tabs.filter(tab => typeof tab.url === 'string' && tab.url.includes(YOUTUBE_HOST));
};

const broadcastToYouTubeTabs = async (message) => {
    const ytTabs = await findYouTubeTabs();
    if (ytTabs.length === 0) return [];

    const promises = ytTabs.map(async (tab) => {
        if (!tab.id) return { tabId: null, result: { error: 'Tab has no id' } };
        const result = await sendMessageToTab(tab.id, message);
        return { tabId: tab.id, result };
    });

    return Promise.all(promises);
};


const connectWebSocket = (url = WS_URL) => {
    socket = new WebSocket(url);

    socket.addEventListener('open', () => {
        console.log('Connected to WebSocket server');
        socket.send(JSON.stringify({ type: 'hello', payload: 'Hello from extension!' }));
    });

    socket.addEventListener('message', async (event) => {
        const raw = event.data;
        console.log('Message from server:', raw);

        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (err) {
            console.warn('Failed to parse server message as JSON:', err, raw);
            return;
        }

        await handleServerMessage(parsed);
    });

    socket.addEventListener('close', () => {
        console.log('WebSocket connection closed');
        // Optional: attempt reconnect logic here if desired
    });

    socket.addEventListener('error', (err) => {
        console.error('WebSocket error:', err);
    });
};

const handleStopAudio = async (payload) => {
    console.log('Stop command received from server:', payload);
    const results = await broadcastToYouTubeTabs({ type: 'STOP_PLAYING', data: payload });

    if (results.length === 0) {
        console.warn('No YouTube tabs found');
        return;
    }

    results.forEach(({ tabId, result }) => {
        console.log(`Response from tab ${tabId}:`, result);
        if (result?.error) console.warn(`Error sending message to tab ${tabId}:`, result.error);
    });
};

const handleGetSong = async (payload) => {
    console.log('Get song command received from server:', payload);
    const results = await broadcastToYouTubeTabs({ type: 'GET_SONG', data: payload });

    if (results.length === 0) {
        console.warn('No YouTube tabs found');
        return;
    }

    // Send back first non-error response (you can adapt to aggregate if needed)
    for (const { tabId, result } of results) {
        if (!result) continue;
        if (result.error) {
            console.warn(`Error from tab ${tabId}:`, result.error);
            continue;
        }

        // result.response might be undefined if the content script didn't reply
        const songName = result.response ?? null;
        if (songName) {
            try {
                socket?.send(JSON.stringify({ type: 'SONG_NAME_RECEIVED', payload: songName }));
            } catch (err) {
                console.error('Failed to send song name back to server:', err);
            }
            // If you want to send only first found song, break here.
            // break;
        }
    }
};

const handleServerMessage = async (parsedData) => {
    if (!parsedData || typeof parsedData.type !== 'string') {
        console.warn('Invalid message from server:', parsedData);
        return;
    }

    switch (parsedData.type) {
        case 'STOP_AUDIO':
            await handleStopAudio(parsedData.payload);
            break;

        case 'GET_SONG':
            await handleGetSong(parsedData.payload);
            break;

        // Add other server types here
        default:
            console.log('Unhandled server event type:', parsedData.type, parsedData.payload);
    }
};

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed — initializing WebSocket');
    connectWebSocket();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === 'sendMessage') {
        try {
            socket?.send(JSON.stringify(msg.payload));
            sendResponse({ status: 'sent' });
        } catch (err) {
            console.error('Failed to send message over socket:', err);
            sendResponse({ status: 'error', error: err.message });
        }
        // We used sendResponse synchronously; return false to indicate no async response will follow.
        return false;
    }
});
