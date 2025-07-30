let socket;

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');

    socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('open', () => {
        console.log('Connected to WebSocket server');
        socket.send(JSON.stringify({ type: 'hello', payload: 'Hello from extension!' }));
    });

    socket.addEventListener('message', (event) => {
        console.log('Message from server:', event.data);
        console.log('event.data.type', event.data.type, JSON.parse(event.data))
        const parsedData = JSON.parse(event.data);
        if(parsedData.type === 'stop'){
            console.log('Message from server stop send', parsedData.payload);
            // chrome.runtime.sendMessage({ type: "STOP_PLAYING", data: parsedData.payload });

            chrome.tabs.query({}, function(tabs) {
                const targetTab = tabs.find(tab => tab.url?.includes("youtube.com/watch"));
                if (targetTab?.id) {
                    chrome.tabs.sendMessage(targetTab.id, {
                        type: "STOP_PLAYING",
                        data: parsedData.payload
                    });
                } else {
                    console.warn("Target tab not found");
                }
            });

            chrome.runtime.sendMessage({ type: "STOP_PLAYING", data: parsedData.payload });
        }
    });

    socket.addEventListener('close', () => {
        console.log('WebSocket closed');
    });

    socket.addEventListener('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

// Optional: expose send API
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'sendMessage') {
        socket?.send(JSON.stringify(msg.payload));
        sendResponse({ status: 'sent' });
    }
});
