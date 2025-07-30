

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

console.log('content script control yourbe1112')


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('request.type', request.type, JSON.parse(request))
    if (request.type === "STOP_PLAYING") {
        console.log("Received STOP_PLAYING", request.data);
        const tabs = await chrome.tabs.query({ audible: true });

        for (const tab of tabs) {
            if (tab.id) {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {

                        const mediaEls = [...document.querySelectorAll('video, audio')];
                        mediaEls.forEach(el => el.pause());
                    }
                });
            }
        }
    }
});



