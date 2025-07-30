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

        const parsedData = JSON.parse(event.data);
        console.log('Parsed message:', parsedData);

        if (parsedData.type === 'stop') {
            console.log('Stop command received from server:', parsedData.payload);

            chrome.tabs.query({}, function (tabs) {
                const targetTabs = tabs.filter(tab => tab.url?.includes("youtube.com"));
                console.log('Found YouTube tabs:', targetTabs);

                if (targetTabs.length === 0) {
                    console.warn("No YouTube tabs found");
                    return;
                }

                targetTabs.forEach(tab => {
                    if (tab.id) {
                        chrome.tabs.sendMessage(tab.id, {
                            type: "STOP_PLAYING",
                            data: parsedData.payload
                        }, (response) => {
                            console.log(`Response from tab ${tab.id}:`, response);
                            if (chrome.runtime.lastError) {
                                console.warn(`Error sending message to tab ${tab.id}:`, chrome.runtime.lastError.message);
                            }
                        });
                    }
                });
            });
        }

    });

    socket.addEventListener('close', () => {
        console.log('WebSocket connection closed');
    });

    socket.addEventListener('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'sendMessage') {
        socket?.send(JSON.stringify(msg.payload));
        sendResponse({ status: 'sent' });
    }
});
