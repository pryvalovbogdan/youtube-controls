document.getElementById('send').addEventListener('click', () => {
    chrome.runtime.sendMessage({
        type: 'sendMessage',
        payload: { type: 'ping', payload: 'Ping from popup!' }
    }, (response) => {
        console.log('Response from background:', response);
    });
});


document.getElementById('control').addEventListener('click', async () => {
    const tabs = await chrome.tabs.query({ audible: true });
    console.warn('tabs', tabs)
    for (const tab of tabs) {
        if (tab.id) {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: toggleMediaPlayback
            });
        }
    }
});

function toggleMediaPlayback() {
    const mediaEls = [...document.querySelectorAll('video, audio')];
    mediaEls.forEach(el => {
        if (!el.paused) {
            el.pause();
        } else {
            el.play();
        }
    });
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    console.log('request.type ', request.type)
    if (request.type === "STOP_PLAYING") {
        console.log("Received data in popup:", request.data);
        // Update popup UI with the received data
        // document.getElementById("myElement").innerText = request.data;

        const tabs = await chrome.tabs.query({ audible: true });
        console.warn('tabs', tabs)
        for (const tab of tabs) {
            if (tab.id) {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: function (){
                        const mediaEls = [...document.querySelectorAll('video, audio')];
                        console.log('mediaEls', mediaEls)
                        mediaEls.forEach(el => {
                            el.pause();
                        });
                    }
                });
            }
        }
    }
});
